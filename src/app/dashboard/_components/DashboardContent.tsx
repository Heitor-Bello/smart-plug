"use client";

import useSWR from "swr";
import { Zap, Activity, Gauge, Clock, AlertCircle, Loader2 } from "lucide-react";

interface Reading {
  id: string;
  current: number;
  power: number;
  energy: number;
  timestamp: string;
}

interface DeviceWithReading {
  id: string;
  name: string;
  latestReading: Reading | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DashboardContent() {
  const { data, error, isLoading } = useSWR<DeviceWithReading[]>(
    "/api/devices/readings/latest",
    fetcher,
    {
      refreshInterval: 10000, // Atualiza a cada 10 segundos
      revalidateOnFocus: true,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-foreground">Erro ao carregar dados</p>
          <p className="text-muted-foreground text-sm">Tente novamente mais tarde</p>
        </div>
      </div>
    );
  }

  const devices = data || [];

  // Calcula totais
  const totalPower = devices.reduce(
    (acc, d) => acc + (d.latestReading?.power || 0),
    0
  );
  const totalEnergy = devices.reduce(
    (acc, d) => acc + (d.latestReading?.energy || 0),
    0
  );
  const activeDevices = devices.filter((d) => d.latestReading !== null).length;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitoramento em tempo real dos seus dispositivos
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Gauge className="w-5 h-5" />}
          label="Potência Total"
          value={`${totalPower.toFixed(1)} W`}
          color="primary"
        />
        <SummaryCard
          icon={<Zap className="w-5 h-5" />}
          label="Energia Total"
          value={`${totalEnergy.toFixed(3)} kWh`}
          color="tertiary"
        />
        <SummaryCard
          icon={<Activity className="w-5 h-5" />}
          label="Dispositivos Ativos"
          value={`${activeDevices} / ${devices.length}`}
          color="green"
        />
        <SummaryCard
          icon={<Clock className="w-5 h-5" />}
          label="Atualização"
          value="A cada 10s"
          color="muted"
        />
      </div>

      {/* Lista de dispositivos */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Dispositivos
        </h2>
        {devices.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum dispositivo cadastrado.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Adicione um dispositivo na página de Dispositivos para começar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "primary" | "tertiary" | "green" | "muted";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    tertiary: "bg-tertiary/10 text-tertiary",
    green: "bg-green-500/10 text-green-500",
    muted: "bg-muted/50 text-muted-foreground",
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function DeviceCard({ device }: { device: DeviceWithReading }) {
  const { latestReading } = device;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
      {/* Header do card */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground truncate">{device.name}</h3>
        <div
          className={`w-2 h-2 rounded-full ${
            latestReading ? "bg-green-500" : "bg-muted"
          }`}
          title={latestReading ? "Com dados" : "Sem dados"}
        />
      </div>

      {latestReading ? (
        <>
          {/* Métricas */}
          <div className="space-y-3">
            <MetricRow
              icon={<Zap className="w-4 h-4 text-primary" />}
              label="Corrente"
              value={`${latestReading.current.toFixed(2)} A`}
            />
            <MetricRow
              icon={<Gauge className="w-4 h-4 text-tertiary" />}
              label="Potência"
              value={`${latestReading.power.toFixed(1)} W`}
            />
            <MetricRow
              icon={<Activity className="w-4 h-4 text-green-500" />}
              label="Energia"
              value={`${latestReading.energy.toFixed(3)} kWh`}
            />
          </div>

          {/* Timestamp */}
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Última leitura: {formatDate(latestReading.timestamp)} às{" "}
              {formatTime(latestReading.timestamp)}
            </p>
          </div>
        </>
      ) : (
        <div className="py-4 text-center">
          <p className="text-muted-foreground text-sm">
            Aguardando dados do dispositivo...
          </p>
        </div>
      )}
    </div>
  );
}

function MetricRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
