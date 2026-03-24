"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const profileSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter no mínimo 2 caracteres"),
  phone: z.string().optional(),
  language: z.string(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  defaultValues?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    language?: string;
  };
}

const languageOptions = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
];

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      phone: defaultValues?.phone ?? "",
      language: defaultValues?.language ?? "pt-BR",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implementar lógica de atualização do perfil
      console.log("Profile data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // TODO: Implementar lógica de cancelamento
    window.history.back();
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

        {/* Telefone e Idioma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Telefone
            </label>
            <input
              {...register("phone")}
              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="+55 (11) 99999-9999"
            />
          </div>

          <Select
            label="Idioma Preferencial"
            options={languageOptions}
            {...register("language")}
          />
        </div>

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
