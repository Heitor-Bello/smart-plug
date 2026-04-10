"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Pencil, Trash2, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(device.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function copyId() {
    navigator.clipboard.writeText(device.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function startEdit() {
    setEditName(device.name);
    setError(null);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setError(null);
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (editName.trim() === device.name) {
      setIsEditing(false);
      return;
    }
    setError(null);
    setIsRenaming(true);
    try {
      const res = await fetch(`/api/devices/${device.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao renomear");
        return;
      }
      setIsEditing(false);
      router.refresh();
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    try {
      await fetch(`/api/devices/${device.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      {isEditing ? (
        <form onSubmit={handleRename} className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={isRenaming}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={isRenaming || editName.trim().length === 0}
          >
            {isRenaming ? <Loader2 size={14} className="animate-spin" /> : "Salvar"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={cancelEdit}
            disabled={isRenaming}
          >
            <X size={14} />
          </Button>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{device.name}</h3>
            <p className="text-sm text-muted-foreground font-mono mt-1 truncate">
              ID: {device.id}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Copy ID */}
            <button
              onClick={copyId}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
              title="Copiar ID"
            >
              {copied ? (
                <Check size={16} className="text-success" />
              ) : (
                <Copy size={16} />
              )}
            </button>

            {/* Edit */}
            <button
              onClick={startEdit}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
              title="Renomear"
            >
              <Pencil size={16} />
            </button>

            {/* Delete */}
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-xs font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    "Confirmar"
                  )}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={handleDelete}
                className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-muted"
                title="Deletar"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
