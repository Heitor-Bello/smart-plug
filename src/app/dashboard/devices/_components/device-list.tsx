"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Device {
  id: string;
  name: string;
  createdAt: Date;
}

export function DeviceList({ devices }: { devices: Device[] }) {
  if (devices.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Nenhum dispositivo cadastrado.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </div>
  );
}

function DeviceCard({ device }: { device: Device }) {
  const [copied, setCopied] = useState(false);

  function copyId() {
    navigator.clipboard.writeText(device.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div>
        <h3 className="font-semibold text-foreground">{device.name}</h3>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          ID: {device.id}
        </p>
      </div>
      <button
        onClick={copyId}
        className="text-muted-foreground hover:text-foreground transition-colors p-2"
        title="Copiar ID"
      >
        {copied ? (
          <Check size={18} className="text-green-500" />
        ) : (
          <Copy size={18} />
        )}
      </button>
    </div>
  );
}
