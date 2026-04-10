import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

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

  const STALE_MS = 60 * 1000;

  const latestReadings = devices
    .map((d) => d.readings[0])
    .filter((r): r is NonNullable<typeof r> => r != null);

  const freshReadings = latestReadings.filter(
    (r) => Date.now() - new Date(r.timestamp).getTime() < STALE_MS,
  );

  const totalPower = freshReadings.reduce((sum, r) => sum + r.power, 0);
  const totalCurrent = freshReadings.reduce((sum, r) => sum + r.current, 0);
  const totalEnergy = latestReadings.reduce((sum, r) => sum + r.energy, 0);
  const activeDevices = freshReadings.length;

  return NextResponse.json({
    devices,
    totalPower,
    totalCurrent,
    totalEnergy,
    activeDevices,
  });
}
