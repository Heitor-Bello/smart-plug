import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  hardwareId: z.string().trim().min(1, "Código do dispositivo é obrigatório"),
  name: z.string().trim().min(1, "Nome do dispositivo é obrigatório"),
});

// Vincula um dispositivo já detectado pelo servidor (via POST /api/esp/[hardwareId]/readings)
// à conta do usuário autenticado, a partir do código impresso/exibido pelo ESP32 no
// primeiro boot. Substitui o fluxo antigo de copiar o cuid gerado e colar no firmware.
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const hardwareId = parsed.data.hardwareId.toUpperCase().replace(/[^0-9A-F]/g, "");

  const device = await prisma.device.findUnique({ where: { hardwareId } });

  if (!device) {
    return NextResponse.json(
      {
        error:
          "Nenhum dispositivo com esse código foi encontrado. Verifique se ele está ligado e conectado à internet.",
      },
      { status: 404 },
    );
  }

  if (device.userId) {
    return NextResponse.json(
      { error: "Este dispositivo já está vinculado a uma conta." },
      { status: 409 },
    );
  }

  const updated = await prisma.device.update({
    where: { id: device.id },
    data: { userId: session.user.id, name: parsed.data.name },
  });

  return NextResponse.json(updated, { status: 200 });
}
