import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { DeviceNotFoundError, getReportData, type Range } from "@/lib/reports";
import { NextRequest, NextResponse } from "next/server";

const CACHE_TTL_MS = 30 * 60 * 1000;

const RANGE_LABELS: Record<Range, string> = {
  "24h": "últimas 24 horas",
  "7d": "últimos 7 dias",
  "30d": "últimos 30 dias",
};

const InsightsSchema = z.object({
  insights: z
    .array(
      z.object({
        title: z.string().describe("Título curto do aviso, em português"),
        message: z
          .string()
          .describe("Explicação do aviso em 1-2 frases, em português, para um usuário leigo"),
        severity: z.enum(["info", "warning", "success"]),
      }),
    )
    .min(1)
    .max(5),
});

const SYSTEM_PROMPT = `Você é o assistente de análise de dados do VoltMetric (também chamado Smart Plug), um app de monitoramento de consumo de energia de tomadas inteligentes.

Contexto sobre os dados que você recebe (sempre já agregados em "buckets" de tempo, nunca leituras cruas):
- "power" (potência, em W) e "current" (corrente, em A) são médias instantâneas dentro de cada bucket.
- "energy" (em kWh) e "cost" (em R$) por bucket já são o CONSUMO daquele intervalo — a diferença entre a última e a primeira leitura acumulada do bucket. Isso é diferente da leitura bruta do hardware, que é cumulativa desde que o dispositivo foi ligado/cadastrado.
- "summary.totalEnergy"/"summary.totalCost" são o consumo total do período inteiro (não a soma exata dos buckets, por causa de arredondamento de borda).
- "summary.peakPower" é o maior valor de potência instantânea já registrado dentro do período.

Sua tarefa: gerar de 1 a 5 avisos curtos, em português, para um usuário leigo (não técnico), a partir dos dados fornecidos. Priorize:
1. Deixar claro o que os números significam quando isso evita confusão (ex: energia é consumo do período, não um valor cumulativo desde sempre).
2. Apontar padrões reais nos dados (picos de consumo, tendência de alta/baixa, horários de maior uso, dispositivo com custo desproporcional).
3. Nunca invente números ou eventos que não estejam nos dados fornecidos. Se os dados forem poucos ou pouco variados, prefira um aviso mais genérico/explicativo a inventar um padrão.

Cada aviso deve ter um título curto, uma mensagem de 1-2 frases, e uma severidade: "info" (explicativo/neutro), "warning" (algo que merece atenção, ex: consumo alto ou pico incomum), "success" (algo positivo, ex: consumo estável ou baixo).`;

export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const deviceIdParam: string | undefined =
    typeof body.deviceId === "string" ? body.deviceId : undefined;
  const rangeParam = body.range;
  const range: Range =
    rangeParam === "7d" || rangeParam === "30d" ? rangeParam : "24h";
  const force = body.force === true;

  // Chave de cache: null representa "todos os dispositivos" (igual a getReportData).
  const deviceCacheKey =
    deviceIdParam && deviceIdParam !== "all" ? deviceIdParam : null;

  if (!force) {
    const cached = await prisma.insight.findFirst({
      where: {
        userId: session.user.id,
        deviceId: deviceCacheKey,
        range,
        createdAt: { gte: new Date(Date.now() - CACHE_TTL_MS) },
      },
      orderBy: { createdAt: "desc" },
    });
    if (cached) {
      return NextResponse.json({
        insights: cached.content,
        generatedAt: cached.createdAt,
        cached: true,
      });
    }
  }

  let data;
  try {
    data = await getReportData({
      userId: session.user.id,
      deviceId: deviceIdParam,
      range,
    });
  } catch (error) {
    if (error instanceof DeviceNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }

  if (data.summary.readingsCount === 0) {
    return NextResponse.json({
      insights: [],
      generatedAt: new Date().toISOString(),
      cached: false,
    });
  }

  const response = await anthropic.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Dados do período selecionado (${RANGE_LABELS[range]}):\n\n${JSON.stringify(
          { summary: data.summary, series: data.series },
        )}`,
      },
    ],
    output_config: { format: zodOutputFormat(InsightsSchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    return NextResponse.json(
      { error: "Não foi possível gerar a análise agora" },
      { status: 502 },
    );
  }

  const insight = await prisma.insight.create({
    data: {
      userId: session.user.id,
      deviceId: deviceCacheKey,
      range,
      content: parsed.insights,
    },
  });

  return NextResponse.json({
    insights: insight.content,
    generatedAt: insight.createdAt,
    cached: false,
  });
}
