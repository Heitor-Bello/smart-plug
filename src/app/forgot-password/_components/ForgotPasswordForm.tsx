"use client";

import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

const schema = z.object({
  email: z.email("Digite um e-mail válido"),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
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
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: "/reset-password",
    });
    if (error) {
      setError("Não foi possível enviar o e-mail. Tente novamente.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6 lg:px-0">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 size={48} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              E-mail enviado!
            </h1>
            <p className="text-muted-foreground">
              Verifique sua caixa de entrada e siga as instruções para redefinir
              sua senha.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft size={16} />
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Recuperar senha
              </h1>
              <p className="text-muted-foreground">
                Informe seu e-mail e enviaremos um link para redefinir sua
                senha.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="E-mail"
                type="email"
                placeholder="nome@email.com"
                icon={<Mail size={20} />}
                error={errors.email?.message}
                disabled={isSubmitting}
                {...register("email")}
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
                    Enviando...
                  </>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Lembrou sua senha?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Fazer login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
