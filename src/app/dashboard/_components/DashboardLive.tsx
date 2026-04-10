"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Battery, Cpu, Zap } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { DeviceReadingCard } from "./DeviceReadingCard";
import Link from "next/link";

interface Reading {
  current: number;
  power: number;
  energy: number;
  timestamp: Date;
}

interface Device {
  id: string;
  name: string;
  readings: Reading[];
}

interface DashboardData {
  devices: Device[];
  totalPower: number;
  totalCurrent: number;
  totalEnergy: number;
  activeDevices: number;
}

const POLL_INTERVAL = 3000;

export function DashboardLive({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchData() {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) return;
      const json: DashboardData = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch {
      // silently ignore network errors — keeps showing last good data
    }
  }

  useEffect(() => {
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const { devices, totalPower, totalCurrent, totalEnergy, activeDevices } = data;

  return (
    <div className="space-y-8">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <span className="text-xs text-muted-foreground">
          Atualização automática a cada 3s
          {lastUpdated && (
            <> &mdash; última às {lastUpdated.toLocaleTimeString("pt-BR")}</>
          )}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Potência Total"
          value={totalPower.toFixed(1)}
          unit="W"
          description="Consumo instantâneo somado"
          icon={<Zap size={18} />}
          color="primary"
        />
        <StatsCard
          title="Corrente Total"
          value={totalCurrent.toFixed(2)}
          unit="A"
          description="Corrente elétrica total"
          icon={<Activity size={18} />}
          color="warning"
        />
        <StatsCard
          title="Energia Acumulada"
          value={totalEnergy.toFixed(3)}
          unit="kWh"
          description="Soma do consumo registrado"
          icon={<Battery size={18} />}
          color="success"
        />
        <StatsCard
          title="Dispositivos Ativos"
          value={String(activeDevices)}
          unit={`de ${devices.length}`}
          description="Com leituras registradas"
          icon={<Cpu size={18} />}
          color="muted"
        />
      </div>

      {/* Devices Section */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Dispositivos
        </h2>

        {devices.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              Nenhum dispositivo cadastrado.{" "}
              <Link
                href="/dashboard/devices"
                className="text-primary hover:underline"
              >
                Adicionar dispositivo
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <DeviceReadingCard
                key={device.id}
                device={device}
                latestReading={device.readings[0] ?? null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
