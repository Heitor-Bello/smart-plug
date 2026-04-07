"use client";

import Link from "next/link";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const schema = z
  .object({
    password: z.string().min(8, "A senha deve conter no mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError(null);
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });
    if (error) {
      setError(
        error.code === "INVALID_TOKEN"
          ? "Link inválido ou expirado. Solicite um novo."
          : "Não foi possível redefinir a senha. Tente novamente.",
      );
    } else {
      setDone(true);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6 lg:px-0 text-center space-y-4">
          <p className="text-muted-foreground">Link inválido ou expirado.</p>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6 lg:px-0">
        {done ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 size={48} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Senha redefinida!
            </h1>
            <p className="text-muted-foreground">
              Sua senha foi atualizada com sucesso.
            </p>
            <Button className="w-full" onClick={() => router.push("/login")}>
              Ir para o login
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Nova senha
              </h1>
              <p className="text-muted-foreground">
                Escolha uma senha segura para sua conta.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Nova senha"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={20} />}
                error={errors.password?.message}
                disabled={isSubmitting}
                {...register("password")}
              />

              <Input
                label="Confirmar senha"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={20} />}
                error={errors.confirm?.message}
                disabled={isSubmitting}
                {...register("confirm")}
              />

              {error && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Redefinir senha"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
