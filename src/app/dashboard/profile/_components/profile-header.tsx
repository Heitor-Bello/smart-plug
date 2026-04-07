"use client";

import Image from "next/image";
import { Pencil, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatarUrl?: string;
}

export function ProfileHeader({ name, email, avatarUrl }: ProfileHeaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setUploadError(json.error ?? "Erro ao enviar imagem.");
        return;
      }

      await authClient.updateUser(
        { image: json.url },
        {
          onSuccess: () => {
            setPreview(json.url);
            router.refresh();
          },
          onError: (ctx) => {
            setUploadError(ctx.error.message ?? "Erro ao atualizar avatar.");
          },
        },
      );
    } catch {
      setUploadError("Erro inesperado. Tente novamente.");
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be re-selected if needed
      e.target.value = "";
    }
  };

  return (
    <div className="bg-card rounded-xl p-6">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary">
            {preview ? (
              <Image
                src={preview}
                alt={`Avatar de ${name}`}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-foreground">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Edit avatar button */}
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Editar avatar"
          >
            {isUploading ? (
              <Loader2 size={14} className="text-primary-foreground animate-spin" />
            ) : (
              <Pencil size={14} className="text-primary-foreground" />
            )}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* User info */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">{name}</h1>
          <p className="text-muted-foreground">{email}</p>
          {uploadError && (
            <p className="text-sm text-destructive">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
