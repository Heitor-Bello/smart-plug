import { prisma } from "@/lib/prisma";

export type Range = "24h" | "7d" | "30d";

export const RANGES: Range[] = ["24h", "7d", "30d"];

const RANGE_MS: Record<Range, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

const BUCKET_MS: Record<Range, number> = {
  "24h": 5 * 60 * 1000,
  "7d": 60 * 60 * 1000,
  "30d": 24 * 60 * 60 * 1000,
};

interface Bucket {
  timestamp: number;
  powerSum: number;
  powerCount: number;
  currentSum: number;
  currentCount: number;
  energy: number;
  cost: number;
}

export interface ReportData {
  devices: { id: string; name: string }[];
  series: {
    timestamp: string;
    power: number;
    current: number;
    energy: number;
    cost: number;
  }[];
  summary: {
    totalEnergy: number;
    totalCost: number;
    avgPower: number;
    peakPower: number;
    peakPowerAt: Date | null;
    readingsCount: number;
  };
}

export class DeviceNotFoundError extends Error {
  constructor() {
    super("Dispositivo não encontrado");
    this.name = "DeviceNotFoundError";
  }
}

// Busca as leituras cruas do período e agrega em memória. Para o porte atual
// do projeto (poucos dispositivos, uso de demonstração) isso é suficiente.
// Se o volume de dados crescer bastante, essa agregação deveria migrar para
// SQL (ex: $queryRaw com date_trunc/bucket), evitando trazer todas as
// leituras cruas para a aplicação.
//
// Reaproveitado por GET /api/reports, pela geração de insights de IA e pela
// tool de chat — todos precisam da mesma agregação, escopada por userId.
export async function getReportData({
  userId,
  deviceId,
  range,
}: {
  userId: string;
  deviceId?: string | null;
  range: Range;
}): Promise<ReportData> {
  const userDevices = await prisma.device.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  let deviceIds: string[];
  if (deviceId && deviceId !== "all") {
    const device = userDevices.find((d) => d.id === deviceId);
    if (!device) {
      throw new DeviceNotFoundError();
    }
    deviceIds = [device.id];
  } else {
    deviceIds = userDevices.map((d) => d.id);
  }

  const now = Date.now();
  const from = new Date(now - RANGE_MS[range]);
  const bucketMs = BUCKET_MS[range];

  const readings =
    deviceIds.length === 0
      ? []
      : await prisma.reading.findMany({
          where: { deviceId: { in: deviceIds }, timestamp: { gte: from } },
          orderBy: { timestamp: "asc" },
          select: {
            deviceId: true,
            timestamp: true,
            power: true,
            current: true,
            energy: true,
            cost: true,
          },
        });

  // Primeiro/última energia e custo por dispositivo dentro do bucket, para
  // calcular o consumo do bucket como delta (energia é cumulativa por leitura).
  const bucketDeviceEdges = new Map<
    string,
    Map<string, { firstEnergy: number; lastEnergy: number; firstCost: number; lastCost: number }>
  >();
  const buckets = new Map<number, Bucket>();

  let peakPower = 0;
  let peakPowerAt: Date | null = null;

  for (const r of readings) {
    const bucketStart =
      Math.floor(new Date(r.timestamp).getTime() / bucketMs) * bucketMs;

    let bucket = buckets.get(bucketStart);
    if (!bucket) {
      bucket = {
        timestamp: bucketStart,
        powerSum: 0,
        powerCount: 0,
        currentSum: 0,
        currentCount: 0,
        energy: 0,
        cost: 0,
      };
      buckets.set(bucketStart, bucket);
    }
    bucket.powerSum += r.power;
    bucket.powerCount += 1;
    bucket.currentSum += r.current;
    bucket.currentCount += 1;

    let deviceEdges = bucketDeviceEdges.get(String(bucketStart));
    if (!deviceEdges) {
      deviceEdges = new Map();
      bucketDeviceEdges.set(String(bucketStart), deviceEdges);
    }
    const edge = deviceEdges.get(r.deviceId);
    if (!edge) {
      deviceEdges.set(r.deviceId, {
        firstEnergy: r.energy,
        lastEnergy: r.energy,
        firstCost: r.cost,
        lastCost: r.cost,
      });
    } else {
      edge.lastEnergy = r.energy;
      edge.lastCost = r.cost;
    }

    if (r.power > peakPower) {
      peakPower = r.power;
      peakPowerAt = r.timestamp;
    }
  }

  for (const [bucketStart, deviceEdges] of bucketDeviceEdges) {
    const bucket = buckets.get(Number(bucketStart))!;
    for (const edge of deviceEdges.values()) {
      bucket.energy += Math.max(0, edge.lastEnergy - edge.firstEnergy);
      bucket.cost += Math.max(0, edge.lastCost - edge.firstCost);
    }
  }

  const series = Array.from(buckets.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((b) => ({
      timestamp: new Date(b.timestamp).toISOString(),
      power: b.powerCount > 0 ? b.powerSum / b.powerCount : 0,
      current: b.currentCount > 0 ? b.currentSum / b.currentCount : 0,
      energy: b.energy,
      cost: b.cost,
    }));

  // Consumo total do período por dispositivo (primeira/última leitura no
  // range inteiro, não por bucket, para não perder consumo nas bordas dos buckets).
  const deviceEdgesTotal = new Map<
    string,
    { firstEnergy: number; lastEnergy: number; firstCost: number; lastCost: number }
  >();
  for (const r of readings) {
    const edge = deviceEdgesTotal.get(r.deviceId);
    if (!edge) {
      deviceEdgesTotal.set(r.deviceId, {
        firstEnergy: r.energy,
        lastEnergy: r.energy,
        firstCost: r.cost,
        lastCost: r.cost,
      });
    } else {
      edge.lastEnergy = r.energy;
      edge.lastCost = r.cost;
    }
  }

  let totalEnergy = 0;
  let totalCost = 0;
  for (const edge of deviceEdgesTotal.values()) {
    totalEnergy += Math.max(0, edge.lastEnergy - edge.firstEnergy);
    totalCost += Math.max(0, edge.lastCost - edge.firstCost);
  }

  const avgPower =
    readings.length > 0
      ? readings.reduce((sum, r) => sum + r.power, 0) / readings.length
      : 0;

  return {
    devices: userDevices,
    series,
    summary: {
      totalEnergy,
      totalCost,
      avgPower,
      peakPower,
      peakPowerAt,
      readingsCount: readings.length,
    },
  };
}
