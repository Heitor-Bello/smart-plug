"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { authClient } from "@/lib/auth-client";

const profileSchema = z.object({
  firstName: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres"),
  lastName: z
    .string()
    .trim()
    .min(2, "Sobrenome deve ter no mínimo 2 caracteres"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  defaultValues?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setSaveError(null);
    setSaveSuccess(null);
    setIsSubmitting(true);

    const fullName = `${data.firstName} ${data.lastName}`
      .replace(/\s+/g, " ")
      .trim();

    try {
      await authClient.updateUser(
        {
          name: fullName,
        },
        {
          onSuccess: () => {
            setSaveSuccess("Perfil atualizado com sucesso.");
            router.refresh();
          },
          onError: (ctx) => {
            setSaveError(
              ctx.error.message || "Não foi possível atualizar o perfil.",
            );
          },
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.replace("/dashboard/devices");
  };

  return (
    <div className="bg-card rounded-xl p-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <User size={20} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Informações Pessoais
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Nome e Sobrenome */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Nome
            </label>
            <input
              {...register("firstName")}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Digite seu nome"
            />
            {errors.firstName && (
              <span className="text-sm text-destructive">
                {errors.firstName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Sobrenome
            </label>
            <input
              {...register("lastName")}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Digite seu sobrenome"
            />
            {errors.lastName && (
              <span className="text-sm text-destructive">
                {errors.lastName.message}
              </span>
            )}
          </div>
        </div>

        {/* E-mail (readonly) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">
            E-mail (Principal)
          </label>
          <div className="relative">
            <input
              type="email"
              value={defaultValues?.email ?? ""}
              readOnly
              disabled
              className="w-full rounded-lg border border-border bg-input/50 px-4 py-3 text-muted-foreground cursor-not-allowed"
            />
            <Lock
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        {saveError && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
            {saveSuccess}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 text-foreground hover:text-muted-foreground transition-colors font-medium"
          >
            Cancelar
          </button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
