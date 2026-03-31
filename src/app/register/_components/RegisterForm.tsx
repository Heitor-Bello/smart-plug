"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, RefreshCw, ArrowRight, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

import { authClient } from "@/lib/auth-client";

const registerSchema = z
  .object({
    fullName: z.string().min(3, "Digite seu nome completo").trim(),
    email: z.email("Digite um e-mail válido"),
    password: z.string().min(8, "A senha deve conter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirme sua senha"),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "Você deve aceitar os termos para criar uma conta",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(formData: RegisterFormData) {
    const {} = await authClient.signUp.email(
      {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        callbackURL: "/login",
      },
      {
        onRequest: (ctx) => {},
        onSuccess: (ctx) => {
          console.log("Conta criada com sucesso: ", ctx);
          router.replace("/login");
        },
        onError: (ctx) => {
          console.log("Erro ao criar conta: ", ctx.error);
        },
      },
    );
  }

  return (
    <div className="flex flex-col justify-center h-full p-8 lg:p-12">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Junte-se à inteligência.
          </h2>
          <p className="text-muted-foreground">
            Crie sua conta no centro de análise energética hoje mesmo.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Nome Completo"
            type="text"
            placeholder="Digite seu nome completo"
            icon={<User size={20} />}
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <Input
            label="Endereço de Email"
            type="email"
            placeholder="nome@email.com"
            icon={<Mail size={20} />}
            error={errors.email?.message}
            disabled={isSubmitting}
            {...register("email")}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={20} />}
            error={errors.password?.message}
            disabled={isSubmitting}
            {...register("password")}
          />

          <Input
            label="Confirmar Senha"
            type="password"
            placeholder="••••••••"
            icon={<RefreshCw size={20} />}
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />

          <div className="pt-2 space-y-2">
            <Controller
              name="acceptTerms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  name={field.name}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  disabled={isSubmitting}
                  label={
                    <>
                      Ao criar uma conta, você concorda com a{" "}                      
                      <Link
                        href="/privacy"
                        className="text-primary hover:underline"
                      >
                        Política de Privacidade
                      </Link>
                      .
                    </>
                  }
                />
              )}
            />

            {errors.acceptTerms?.message && (
              <p className="text-sm text-destructive">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Criando conta...
              </>
            ) : (
              <>
                Criar Conta
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-muted-foreground mt-8">
          Já possui uma conta?{" "}
          <Link
            href="/login"
            className="text-foreground font-medium hover:text-primary transition-colors"
          >
            Faça login
            <span className="ml-1">&rsaquo;</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
