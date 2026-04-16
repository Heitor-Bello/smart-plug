"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Battery, Cpu, DollarSign, Pencil, Zap } from "lucide-react";
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
  tariff: number;
}

const POLL_INTERVAL = 1000;

export function DashboardLive({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [now, setNow] = useState<Date>(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tariff editing state
  const [editingTariff, setEditingTariff] = useState(false);
  const [tariffInput, setTariffInput] = useState(String(initialData.tariff));
  const [tariffSaving, setTariffSaving] = useState(false);

  async function fetchData() {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) return;
      const json: DashboardData = await res.json();
      setData(json);
      setNow(new Date());
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

  async function saveTariff() {
    const value = parseFloat(tariffInput.replace(",", "."));
    if (isNaN(value) || value < 0) return;
    setTariffSaving(true);
    try {
      const res = await fetch("/api/user/tariff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tariff: value }),
      });
      if (res.ok) {
        setData((prev) => ({ ...prev, tariff: value }));
        setEditingTariff(false);
      }
    } finally {
      setTariffSaving(false);
    }
  }

  const { devices, totalPower, totalCurrent, totalEnergy, activeDevices, tariff } = data;
  const totalCost = totalEnergy * tariff;

  return (
    <div className="space-y-8">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <span className="text-xs text-muted-foreground">
          Atualização automática a cada 1s
          <> &mdash; {now.toLocaleTimeString("pt-BR")}</>
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

      {/* Cost Card */}
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center gap-6 hover:border-primary ease-in-out duration-200">
        {/* Icon + cost */}
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 rounded-lg text-success bg-success/10">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Custo Estimado</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-bold text-success">
                {tariff > 0 ? `R$ ${totalCost.toFixed(2)}` : "—"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tariff > 0
                ? `Baseado na tarifa de R$ ${tariff.toFixed(2)}/kWh`
                : "Defina a tarifa ao lado para ver o custo"}
            </p>
          </div>
        </div>

        {/* Tariff input */}
        <div className="flex flex-col gap-1.5 sm:w-64">
          <label className="text-xs font-medium text-muted-foreground">
            Tarifa (R$/kWh)
          </label>
          {editingTariff ? (
            <div className="flex gap-2 w-full">
              <input
                type="text"
                inputMode="decimal"
                value={tariffInput}
                onChange={(e) => setTariffInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTariff();
                  if (e.key === "Escape") setEditingTariff(false);
                }}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <button
                onClick={saveTariff}
                disabled={tariffSaving}
                className="shrink-0 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {tariffSaving ? "…" : "Salvar"}
              </button>
              <button
                onClick={() => setEditingTariff(false)}
                className="shrink-0 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTariffInput(String(tariff));
                setEditingTariff(true);
              }}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-left hover:border-primary transition-colors"
            >
              <span className={tariff > 0 ? "text-foreground" : "text-muted-foreground"}>
                {tariff > 0 ? `R$ ${tariff.toFixed(2)}` : "Clique para definir"}
              </span>
              <Pencil size={13} className="text-muted-foreground shrink-0" />
            </button>
          )}
        </div>
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



