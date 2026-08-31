import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Recebe leituras do ESP32 identificado pelo seu ID de fábrica (hardwareId, derivado
// do MAC address), não pelo cuid interno usado pelo app. Se o hardwareId ainda não
// existir no banco, o dispositivo é auto-registrado como "não pareado" (sem userId).
// Enquanto não pareado, a leitura não é persistida (não há tarifa/dono para calcular
// o custo) — o dispositivo só passa a gerar histórico depois que o usuário o vincula
// à conta via POST /api/devices/claim.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hardwareId: string }> },
) {
  const { hardwareId } = await params;

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

  let device = await prisma.device.findUnique({
    where: { hardwareId },
    include: { user: { select: { tariff: true } } },
  });

  if (!device) {
    device = await prisma.device.create({
      data: {
        hardwareId,
        name: `Novo dispositivo (${hardwareId})`,
      },
      include: { user: { select: { tariff: true } } },
    });
  }

  if (typeof rele === "boolean") {
    await prisma.device.update({
      where: { id: device.id },
      data: { relayStatus: rele },
    });
  }

  if (!device.userId) {
    return NextResponse.json(
      {
        claimed: false,
        message: "Dispositivo detectado, aguardando pareamento no app",
      },
      { status: 202 },
    );
  }

  const custo = energia * (device.user?.tariff ?? 0);

  const reading = await prisma.reading.create({
    data: {
      current: corrente,
      power: potencia,
      energy: energia,
      cost: custo,
      relayOn: typeof rele === "boolean" ? rele : true,
      deviceId: device.id,
    },
  });

  return NextResponse.json({ id: reading.id, claimed: true }, { status: 201 });
}
