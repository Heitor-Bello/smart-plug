import { ReactNode } from "react";
import { Activity, Battery, Zap, Wifi, WifiOff } from "lucide-react";

interface Reading {
  current: number;
  power: number;
  energy: number;
  timestamp: Date;
}

interface Device {
  id: string;
  name: string;
}

interface DeviceReadingCardProps {
  device: Device;
  latestReading: Reading | null;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "agora mesmo";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days} dia${days > 1 ? "s" : ""}`;
}

export function DeviceReadingCard({
  device,
  latestReading,
}: DeviceReadingCardProps) {
  const isActive = latestReading !== null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">{device.name}</h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
            {device.id}
          </p>
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
            isActive
              ? "text-success bg-success/10"
              : "text-muted-foreground bg-muted"
          }`}
        >
          {isActive ? <Wifi size={12} /> : <WifiOff size={12} />}
          {isActive ? "Ativo" : "Sem dados"}
        </span>
      </div>

      {/* Readings */}
      {latestReading ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <ReadingMetric
              icon={<Zap size={14} />}
              label="Potência"
              value={latestReading.power.toFixed(1)}
              unit="W"
              color="primary"
            />
            <ReadingMetric
              icon={<Activity size={14} />}
              label="Corrente"
              value={latestReading.current.toFixed(2)}
              unit="A"
              color="warning"
            />
            <ReadingMetric
              icon={<Battery size={14} />}
              label="Energia"
              value={latestReading.energy.toFixed(3)}
              unit="kWh"
              color="success"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Última leitura: {timeAgo(latestReading.timestamp)}
          </p>
        </>
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Aguardando primeiras leituras…
          </p>
        </div>
      )}
    </div>
  );
}

function ReadingMetric({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit: string;
  color: "primary" | "warning" | "success";
}) {
  const colorMap = {
    primary: "text-primary",
    warning: "text-warning",
    success: "text-success",
  };

  return (
    <div className="rounded-lg bg-muted/50 p-3 space-y-1">
      <div className={`flex items-center gap-1 text-xs ${colorMap[color]}`}>
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-xs text-muted-foreground">{unit}</p>
    </div>
  );
}
