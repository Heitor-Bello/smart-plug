import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DeviceList } from "./_components/device-list";
import { AddDeviceForm } from "./_components/add-device-form";

export default async function DevicesPage() {
  const session = await getServerSession();

  const devices = await prisma.device.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dispositivos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas tomadas inteligentes.
          </p>
        </div>

        <AddDeviceForm />

        <DeviceList devices={devices} />
      </div>
    </div>
  );
}
