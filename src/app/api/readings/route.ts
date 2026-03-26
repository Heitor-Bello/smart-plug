import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { mac, corrente, potencia, energia } = body;

  // Valida MAC
  if (!mac || typeof mac !== "string") {
    return NextResponse.json(
      { error: "Campo 'mac' é obrigatório" },
      { status: 400 },
    );
  }

  // Valida dados numéricos
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

  // Validação de range
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

  // Busca ou cria o device pelo MAC address
  const device = await prisma.device.upsert({
    where: { macAddress: mac },
    update: {},
    create: {
      macAddress: mac,
      status: "pending",
    },
  });

  // Salva a leitura
  const reading = await prisma.reading.create({
    data: {
      current: corrente,
      power: potencia,
      energy: energia,
      deviceId: device.id,
    },
  });

  return NextResponse.json(
    { id: reading.id, deviceStatus: device.status },
    { status: 201 },
  );
}
