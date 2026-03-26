import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DeviceList } from "./_components/device-list";
import { PendingDevices } from "./_components/pending-devices";

export default async function DevicesPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const devices = await prisma.device.findMany({
    where: { userId: session.user.id, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  const pendingDevices = await prisma.device.findMany({
    where: { status: "pending", userId: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dispositivos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas tomadas inteligentes.
          </p>
        </div>

        <PendingDevices devices={pendingDevices} />

        <DeviceList devices={devices} />
      </div>
    </main>
  );
}
