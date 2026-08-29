import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { DeviceNotFoundError, getReportData, type Range } from "@/lib/reports";
import { NextRequest, NextResponse } from "next/server";

const MAX_ITERATIONS = 4;

const GET_CONSUMPTION_DATA_TOOL: Anthropic.Tool = {
  name: "get_consumption_data",
  description:
    "Retorna dados agregados de consumo de energia (potência, corrente, energia, custo) de um período, para um dispositivo específico ou para todos os dispositivos do usuário atual. Use sempre que o usuário perguntar sobre consumo, custo, potência ou energia de um período — nunca estime ou invente números.",
  input_schema: {
    type: "object",
    properties: {
      deviceId: {
        type: "string",
        description:
          "ID de um dos dispositivos do usuário (ver lista no system prompt), ou 'all' para todos os dispositivos somados.",
      },
      range: {
        type: "string",
        enum: ["24h", "7d", "30d"],
        description: "Período consultado.",
      },
    },
    required: ["range"],
  },
};

function buildSystemPrompt(devices: { id: string; name: string }[]) {
  const deviceList =
    devices.length > 0
      ? devices.map((d) => `- ${d.name} (id: ${d.id})`).join("\n")
      : "(nenhum dispositivo cadastrado ainda)";

  return `Você é o assistente do VoltMetric (também chamado Smart Plug), um app de monitoramento e controle de tomadas inteligentes.

O que o app faz: o usuário cadastra "dispositivos" (tomadas inteligentes conectadas a um ESP32), que enviam leituras de consumo periodicamente. O dashboard mostra potência/corrente instantâneas e energia acumulada em tempo real; a tela de relatórios mostra o histórico agregado; o usuário pode ligar/desligar o relé remotamente e definir uma tarifa de energia (R$/kWh) para estimar o custo.

Como interpretar os dados que a ferramenta get_consumption_data retorna:
- Vêm agregados em "buckets" de tempo (5 min para 24h, 1h para 7d, 1 dia para 30d).
- "power" (W) e "current" (A) por bucket são médias instantâneas.
- "energy" (kWh) e "cost" (R$) por bucket já são o consumo daquele intervalo específico (não um valor cumulativo desde sempre).
- "summary.totalEnergy"/"summary.totalCost" são o total do período inteiro consultado.
- "summary.peakPower" é o maior valor de potência instantânea no período.
- Um dispositivo "Offline"/"Sem dados" apenas não tem leitura recente (>10s) — não significa erro.

Dispositivos cadastrados por este usuário:
${deviceList}

Regras:
- Sempre que a pergunta envolver números reais de consumo, custo, potência ou energia, chame get_consumption_data — nunca estime ou invente valores.
- Se o usuário não especificar um dispositivo, use deviceId "all".
- Se o usuário não especificar um período, assuma "24h" e diga isso na resposta.
- Responda em português, de forma direta e curta (poucas frases). Você também pode responder perguntas sobre como o app funciona sem usar a ferramenta.`;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const incoming: unknown[] = Array.isArray(body.messages) ? body.messages : [];

  const history: Anthropic.MessageParam[] = incoming
    .filter(
      (m: unknown): m is { role: string; content: string } =>
        typeof m === "object" &&
        m !== null &&
        ((m as { role?: unknown }).role === "user" ||
          (m as { role?: unknown }).role === "assistant") &&
        typeof (m as { content?: unknown }).content === "string",
    )
    .slice(-20)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
  }

  const devices = await prisma.device.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  const system = buildSystemPrompt(devices);
  const userId = session.user.id;
  const encoder = new TextEncoder();

  const responseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const messages: Anthropic.MessageParam[] = [...history];

      try {
        for (let i = 0; i < MAX_ITERATIONS; i++) {
          const anthropicStream = anthropic.messages.stream({
            model: "claude-opus-5",
            max_tokens: 4096,
            system,
            tools: [GET_CONSUMPTION_DATA_TOOL],
            messages,
          });

          anthropicStream.on("text", (delta) => {
            controller.enqueue(encoder.encode(delta));
          });

          const response = await anthropicStream.finalMessage();
          messages.push({ role: "assistant", content: response.content });

          if (response.stop_reason !== "tool_use") {
            controller.close();
            return;
          }

          const toolUseBlocks = response.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
          );

          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const tool of toolUseBlocks) {
            if (tool.name === "get_consumption_data") {
              const input = tool.input as { deviceId?: string; range?: string };
              const range: Range =
                input.range === "7d" || input.range === "30d" ? input.range : "24h";
              try {
                const data = await getReportData({ userId, deviceId: input.deviceId, range });
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: tool.id,
                  content: JSON.stringify(data),
                });
              } catch (error) {
                const errorMessage =
                  error instanceof DeviceNotFoundError
                    ? error.message
                    : "Erro ao buscar dados de consumo";
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: tool.id,
                  content: errorMessage,
                  is_error: true,
                });
              }
            } else {
              toolResults.push({
                type: "tool_result",
                tool_use_id: tool.id,
                content: "Ferramenta desconhecida",
                is_error: true,
              });
            }
          }

          messages.push({ role: "user", content: toolResults });
        }

        controller.enqueue(
          encoder.encode(
            "\n\nDesculpe, não consegui concluir a resposta. Tente reformular a pergunta.",
          ),
        );
        controller.close();
      } catch (error) {
        console.error("Erro no chat:", error);
        controller.enqueue(encoder.encode("\n\nOcorreu um erro ao gerar a resposta."));
        controller.close();
      }
    },
  });

  return new Response(responseStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
