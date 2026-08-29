"use client";

import { useEffect, useState } from "react";
import { Battery, DollarSign, Loader2, RefreshCw, TrendingUp, Zap } from "lucide-react";
import { StatsCard } from "../../_components/StatsCard";
import { ReportFilters, type Range } from "./ReportFilters";
import { PowerChart } from "./PowerChart";
import { EnergyChart } from "./EnergyChart";

interface Device {
  id: string;
  name: string;
}

interface SeriesPoint {
  timestamp: string;
  power: number;
  current: number;
  energy: number;
  cost: number;
}

interface Summary {
  totalEnergy: number;
  totalCost: number;
  avgPower: number;
  peakPower: number;
  peakPowerAt: string | null;
  readingsCount: number;
}

interface ReportData {
  series: SeriesPoint[];
  summary: Summary;
}

export function ReportsView({ devices }: { devices: Device[] }) {
  const [deviceId, setDeviceId] = useState("all");
  const [range, setRange] = useState<Range>("24h");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ deviceId, range });
      const res = await fetch(`/api/reports?${params}`, { cache: "no-store" });
      if (!res.ok) {
        setError("Não foi possível carregar o relatório.");
        return;
      }
      const json: ReportData = await res.json();
      setData(json);
    } catch {
      setError("Erro de conexão ao carregar o relatório.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, range]);

  if (devices.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          Nenhum dispositivo cadastrado ainda. Cadastre um dispositivo para
          começar a ver relatórios de consumo.
        </p>
      </div>
    );
  }

  const summary = data?.summary;
  const series = data?.series ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <ReportFilters
          devices={devices}
          deviceId={deviceId}
          range={range}
          onDeviceChange={setDeviceId}
          onRangeChange={setRange}
        />
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Atualizar
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!error && summary && summary.readingsCount === 0 && !loading && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            Nenhuma leitura registrada nesse período.
          </p>
        </div>
      )}

      {!error && summary && summary.readingsCount > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Energia no Período"
              value={summary.totalEnergy.toFixed(3)}
              unit="kWh"
              description="Consumo acumulado no período"
              icon={<Battery size={18} />}
              color="success"
            />
            <StatsCard
              title="Custo Estimado"
              value={`R$ ${summary.totalCost.toFixed(2)}`}
              unit=""
              description="Baseado na tarifa configurada"
              icon={<DollarSign size={18} />}
              color="success"
            />
            <StatsCard
              title="Potência Média"
              value={summary.avgPower.toFixed(1)}
              unit="W"
              description="Média das leituras no período"
              icon={<Zap size={18} />}
              color="primary"
            />
            <StatsCard
              title="Pico de Potência"
              value={summary.peakPower.toFixed(1)}
              unit="W"
              description={
                summary.peakPowerAt
                  ? `Em ${new Date(summary.peakPowerAt).toLocaleString("pt-BR")}`
                  : "—"
              }
              icon={<TrendingUp size={18} />}
              color="warning"
            />
          </div>

          <PowerChart series={series} range={range} />
          <EnergyChart series={series} range={range} />
        </>
      )}
    </div>
  );
}
