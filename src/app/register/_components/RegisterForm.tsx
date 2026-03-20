"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, RefreshCw, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nome Completo"
            name="fullName"
            type="text"
            placeholder="Digite seu nome completo"
            icon={<User size={20} />}
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <Input
            label="Endereço de Email"
            name="email"
            type="email"
            placeholder="nome@email.com"
            icon={<Mail size={20} />}
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Senha"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={20} />}
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Confirmar Senha"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            icon={<RefreshCw size={20} />}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <div className="pt-2">
            <Checkbox
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              label={
                <>
                  Ao criar uma conta, você concorda com os{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Termos de Serviço
                  </Link>{" "}
                  e{" "}
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
          </div>

          <Button type="submit" className="w-full mt-6">
            Criar Conta
            <ArrowRight size={18} />
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
