import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ deviceId: string }> };

// Renomear device
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { deviceId } = await params;
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Nome do dispositivo é obrigatório" },
      { status: 400 },
    );
  }

  const device = await prisma.device.findUnique({ where: { id: deviceId } });

  if (!device || device.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Dispositivo não encontrado" },
      { status: 404 },
    );
  }

  const updated = await prisma.device.update({
    where: { id: deviceId },
    data: { name: name.trim() },
  });

  return NextResponse.json(updated);
}

// Deletar device
export async function DELETE(
  _request: NextRequest,
  { params }: Params,
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { deviceId } = await params;

  const device = await prisma.device.findUnique({ where: { id: deviceId } });

  if (!device || device.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Dispositivo não encontrado" },
      { status: 404 },
    );
  }

  await prisma.device.delete({ where: { id: deviceId } });

  return new NextResponse(null, { status: 204 });
}
