"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Wifi, Loader2, Link as LinkIcon } from "lucide-react";

interface PendingDevice {
  id: string;
  macAddress: string;
  createdAt: Date;
}

export function PendingDevices({ devices }: { devices: PendingDevice[] }) {
  if (devices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center">
        <Wifi size={32} className="mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">
          Nenhum dispositivo aguardando vinculação.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Conecte um ESP32 à rede e ele aparecerá aqui automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        Dispositivos encontrados
      </h2>
      <p className="text-sm text-muted-foreground">
        Esses dispositivos foram detectados na rede. Dê um nome e vincule à sua
        conta.
      </p>
      <div className="space-y-3">
        {devices.map((device) => (
          <PendingDeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}

function PendingDeviceCard({ device }: { device: PendingDevice }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim() {
    if (!name.trim()) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: device.id, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao vincular dispositivo");
        return;
      }

      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-tertiary animate-pulse" />
        <span className="text-sm font-mono text-muted-foreground">
          MAC: {device.macAddress}
        </span>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            placeholder="Nome do dispositivo (ex: Tomada Sala)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleClaim}
          disabled={isLoading || name.trim().length === 0}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LinkIcon size={18} />
          )}
          Vincular
        </Button>
      </div>

      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
