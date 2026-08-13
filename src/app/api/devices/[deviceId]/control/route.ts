import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ deviceId: string }> };

// GET: Busca o status atual do relé
export async function GET(request: NextRequest, { params }: Params) {
  const { deviceId } = await params;

  // Verifica se o device existe
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { id: true, relayStatus: true },
  });

  if (!device) {
    return NextResponse.json(
      { error: "Device não encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    deviceId: device.id,
    ligado: device.relayStatus,
  });
}

// POST: Atualiza o status do relé (requer autenticação)
export async function POST(request: NextRequest, { params }: Params) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { deviceId } = await params;

  // Verifica se o device existe e pertence ao usuário
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { id: true, userId: true },
  });

  if (!device) {
    return NextResponse.json(
      { error: "Device não encontrado" },
      { status: 404 },
    );
  }

  if (device.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Acesso negado" },
      { status: 403 },
    );
  }

  // Valida o body
  const body = await request.json();
  const { ligado } = body;

  if (typeof ligado !== "boolean") {
    return NextResponse.json(
      { error: "Campo 'ligado' é obrigatório e deve ser um booleano" },
      { status: 400 },
    );
  }

  // Atualiza o status do relé
  const updated = await prisma.device.update({
    where: { id: deviceId },
    data: { relayStatus: ligado },
  });

  return NextResponse.json({
    deviceId: updated.id,
    ligado: updated.relayStatus,
  });
}

// PUT: Alias para POST (alguns clientes podem preferir PUT)
export async function PUT(request: NextRequest, { params }: Params) {
  return POST(request, { params });
}
