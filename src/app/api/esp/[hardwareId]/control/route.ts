import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Consultado pelo ESP32 a cada ciclo, identificado pelo hardwareId (não pelo cuid
// interno). Somente leitura — o auto-registro do dispositivo acontece em
// POST /api/esp/[hardwareId]/readings, chamado no mesmo ciclo do firmware.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hardwareId: string }> },
) {
  const { hardwareId } = await params;

  const device = await prisma.device.findUnique({
    where: { hardwareId },
    select: { relayStatus: true, userId: true },
  });

  if (!device) {
    return NextResponse.json({ claimed: false, ligado: true });
  }

  return NextResponse.json({
    claimed: device.userId !== null,
    ligado: device.relayStatus,
  });
}
