import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardLive } from "./_components/DashboardLive";

export default async function DashboardPage() {
  const session = await getServerSession();

  const devices = await prisma.device.findMany({
    where: { userId: session!.user.id },
    include: {
      readings: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const latestReadings = devices
    .map((d) => d.readings[0])
    .filter((r): r is NonNullable<typeof r> => r != null);

  const totalPower = latestReadings.reduce((sum, r) => sum + r.power, 0);
  const totalCurrent = latestReadings.reduce((sum, r) => sum + r.current, 0);
  const totalEnergy = latestReadings.reduce((sum, r) => sum + r.energy, 0);
  const activeDevices = latestReadings.length;

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do consumo de energia dos seus dispositivos.
          </p>
        </div>

        <DashboardLive
          initialData={{
            devices,
            totalPower,
            totalCurrent,
            totalEnergy,
            activeDevices,
          }}
        />
      </div>
    </div>
  );
}
 
