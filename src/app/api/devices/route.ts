import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// Criar device
export async function POST(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Nome do dispositivo é obrigatório" },
      { status: 400 },
    );
  }

  const device = await prisma.device.create({
    data: {
      name: name.trim(),
      userId: session.user.id,
    },
  });

  return NextResponse.json(device, { status: 201 });
}

// Listar devices do usuário
export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const devices = await prisma.device.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(devices);
}
