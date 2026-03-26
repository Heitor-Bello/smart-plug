"use client";

import { useState } from "react";
import { Copy, Check, Cpu } from "lucide-react";

interface Device {
  id: string;
  name: string | null;
  macAddress: string;
  status: string;
  createdAt: Date;
}

export function DeviceList({ devices }: { devices: Device[] }) {
  if (devices.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Meus dispositivos
        </h2>
        <p className="text-muted-foreground text-center py-8">
          Nenhum dispositivo vinculado à sua conta.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-3">
        Meus dispositivos
      </h2>
      <div className="space-y-3">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}

function DeviceCard({ device }: { device: Device }) {
  const [copied, setCopied] = useState(false);

  function copyMac() {
    navigator.clipboard.writeText(device.macAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Cpu size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            {device.name ?? "Sem nome"}
          </h3>
          <p className="text-sm text-muted-foreground font-mono mt-0.5">
            {device.macAddress}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          Ativo
        </span>
        <button
          onClick={copyMac}
          className="text-muted-foreground hover:text-foreground transition-colors p-2"
          title="Copiar MAC"
        >
          {copied ? (
            <Check size={18} className="text-green-500" />
          ) : (
            <Copy size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
