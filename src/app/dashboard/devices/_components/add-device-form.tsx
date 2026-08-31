"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Loader2 } from "lucide-react";

export function AddDeviceForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [hardwareId, setHardwareId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/devices/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, hardwareId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao parear dispositivo");
        return;
      }

      setName("");
      setHardwareId("");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Já seguiu os passos acima e anotou o código? Digite ele e um nome para o
        dispositivo abaixo.
      </p>
      <div className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <Input
            label="Código do dispositivo"
            placeholder="Ex: AC67B2C1D2E3"
            value={hardwareId}
            onChange={(e) => setHardwareId(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <Input
            label="Nome do dispositivo"
            placeholder="Ex: Tomada Sala"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={
            isLoading || name.trim().length === 0 || hardwareId.trim().length === 0
          }
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Plus size={18} />
          )}
          Parear
        </Button>
      </div>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </form>
  );
}
