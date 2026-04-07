import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getServerSession } from "@/lib/session";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo de arquivo não suportado. Use JPEG, PNG, WEBP ou GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Arquivo muito grande. O limite é 5 MB." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate magic bytes for common image types
  const isValidImage =
    (buffer[0] === 0xff && buffer[1] === 0xd8) || // JPEG
    (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) || // PNG
    (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) || // WEBP (RIFF)
    (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46); // GIF

  if (!isValidImage) {
    return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `avatars/${session.user.id}-${Date.now()}.${ext}`;

  const blob = await put(filename, buffer, {
    access: "public",
    contentType: file.type,
  });

  // Delete previous avatar if it was stored in Vercel Blob
  const oldImage = session.user.image;
  if (oldImage?.includes(".public.blob.vercel-storage.com")) {
    await del(oldImage).catch(() => null);
  }

  return NextResponse.json({ url: blob.url });
}
