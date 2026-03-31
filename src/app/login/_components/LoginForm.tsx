"use client";

import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { set, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

const loginSchema = z.object({
  email: z.email("Digite um e-mail válido"),
  password: z.string().min(8, "A senha deve conter no mínimo 8 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();

  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(formData: LoginFormData) {
    setAuthError(null);

    await authClient.signIn.email(
      {
        email: formData.email,
        password: formData.password,
        callbackURL: "/dashboard/devices",
      },
      {
        onRequest: (ctx) => { },
        onSuccess: (ctx) => {
          console.log("Login bem-sucedido: ", ctx);
          router.replace("/dashboard/devices");
        },
        onError: (ctx) => {
          setAuthError(
            ctx.error.code === "INVALID_EMAIL_OR_PASSWORD"
              ? "E-mail ou senha inválidos"
              : "Erro ao fazer login",
          );
        },
      },
    );
  }

  async function handleSignInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard/devices",
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6 lg:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Login</h1>
          <p className="text-muted-foreground">
            Acesse sua conta para gerenciar seus dispositivos.
          </p>
        </div>

        {/* Form */}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Senha</span>
            </div>
            <div className="relative">
              <Input
                type="password"
                placeholder="••••••••"
                icon={<Lock size={20} />}
                error={errors.password?.message}
                disabled={isSubmitting}
                {...register("password")}
              />
            </div>
          </div>

          {authError && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {authError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        {/* Create Account Link */}
        <p className="text-center text-muted-foreground mt-6">
          Nao possui uma conta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Criar conta
          </Link>
        </p>

        {/* SSO Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-4 text-muted-foreground">
              Ou acesse com:
            </span>
          </div>
        </div>

        {/* Google Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignInWithGoogle}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-4">
          <span>© 2024 VoltMetric Pro</span>
          <Link href="/privacy" className="hover:text-foreground">
            Privacidade
          </Link>
          <Link href="/support" className="hover:text-foreground">
            Suporte
          </Link>
        </div>
      </footer>
    </div>
  );
}
