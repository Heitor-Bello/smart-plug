import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Busca todos os dispositivos do usuário com a última leitura de cada um
  const devices = await prisma.device.findMany({
    where: { userId: session.user.id },
    include: {
      readings: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Formata os dados para o frontend
  const devicesWithLatestReading = devices.map((device) => ({
    id: device.id,
    name: device.name,
    latestReading: device.readings[0] || null,
  }));

  return NextResponse.json(devicesWithLatestReading);
}
