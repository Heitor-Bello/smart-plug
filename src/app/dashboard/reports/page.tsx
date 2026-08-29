import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ReportsView } from "./_components/ReportsView";

export default async function ReportsPage() {
  const session = await getServerSession();

  const devices = await prisma.device.findMany({
    where: { userId: session!.user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Histórico de consumo de energia por período e dispositivo.
          </p>
        </div>

        <ReportsView devices={devices} />
      </div>
    </div>
  );
}
