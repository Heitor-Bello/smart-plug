import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> },
) {
  const { deviceId } = await params;

  // Verifica se o device existe e busca o usuário
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: { user: { select: { tariff: true } } },
  });

  if (!device) {
    return NextResponse.json(
      { error: "Device não encontrado" },
      { status: 404 },
    );
  }

  // Valida o body
  const body = await request.json();
  const { corrente, potencia, energia, rele } = body;

  if (
    typeof corrente !== "number" ||
    typeof potencia !== "number" ||
    typeof energia !== "number"
  ) {
    return NextResponse.json(
      {
        error:
          "Campos corrente, potencia e energia são obrigatórios e devem ser números",
      },
      { status: 400 },
    );
  }

  // Validação de range (evita dados absurdos)
  if (
    corrente < 0 ||
    corrente > 100 ||
    potencia < 0 ||
    potencia > 25000 ||
    energia < 0
  ) {
    return NextResponse.json(
      { error: "Valores fora do range permitido" },
      { status: 422 },
    );
  }

  // Calcula o custo com base na tarifa do usuário (dispositivo ainda não pareado não tem tarifa)
  const custo = energia * (device.user?.tariff ?? 0);

  // Salva a leitura
  const reading = await prisma.reading.create({
    data: {
      current: corrente,
      power: potencia,
      energy: energia,
      cost: custo,
      relayOn: typeof rele === "boolean" ? rele : true,
      deviceId,
    },
  });

  // Se o status do relé foi enviado, atualiza no device também
  if (typeof rele === "boolean") {
    await prisma.device.update({
      where: { id: deviceId },
      data: { relayStatus: rele },
    });
  }

  return NextResponse.json({ id: reading.id }, { status: 201 });
}
