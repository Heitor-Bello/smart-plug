import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// Vincular device pendente ao usuário
export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { deviceId, name } = body;

  if (!deviceId || typeof deviceId !== "string") {
    return NextResponse.json(
      { error: "ID do dispositivo é obrigatório" },
      { status: 400 },
    );
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Nome do dispositivo é obrigatório" },
      { status: 400 },
    );
  }

  // Busca o device pendente
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
  });

  if (!device) {
    return NextResponse.json(
      { error: "Dispositivo não encontrado" },
      { status: 404 },
    );
  }

  if (device.status === "active" && device.userId) {
    return NextResponse.json(
      { error: "Dispositivo já vinculado a um usuário" },
      { status: 409 },
    );
  }

  // Vincula ao usuário
  const updated = await prisma.device.update({
    where: { id: deviceId },
    data: {
      name: name.trim(),
      userId: session.user.id,
      status: "active",
    },
  });

  return NextResponse.json(updated);
}

// Listar devices do usuário (ativos) + devices pendentes (sem dono)
export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const includePending = searchParams.get("pending") === "true";

  // Devices vinculados ao usuário
  const userDevices = await prisma.device.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!includePending) {
    return NextResponse.json(userDevices);
  }

  // Devices pendentes (sem dono) para vinculação
  const pendingDevices = await prisma.device.findMany({
    where: { status: "pending", userId: null },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    devices: userDevices,
    pending: pendingDevices,
  });
}
