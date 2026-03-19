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
            Join the intelligence.
          </h2>
          <p className="text-muted-foreground">
            Create your command center account today.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            icon={<User size={20} />}
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@company.com"
            icon={<Mail size={20} />}
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={20} />}
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Confirm Password"
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
                  By creating an account, you agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </>
              }
            />
          </div>

          <Button type="submit" className="w-full mt-6">
            Create Account
            <ArrowRight size={18} />
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground font-medium hover:text-primary transition-colors"
          >
            Login here
            <span className="ml-1">&rsaquo;</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
