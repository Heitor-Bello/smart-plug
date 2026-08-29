import { getServerSession } from "@/lib/session";
import { DeviceNotFoundError, getReportData, type Range } from "@/lib/reports";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  const rangeParam = searchParams.get("range");
  const range: Range =
    rangeParam === "7d" || rangeParam === "30d" ? rangeParam : "24h";

  try {
    const data = await getReportData({ userId: session.user.id, deviceId, range });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof DeviceNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
