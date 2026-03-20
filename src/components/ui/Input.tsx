"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, type, className = "", id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const isPassword = type === "password";

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm text-muted-foreground">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            aria-invalid={!!error}
            className={`
              w-full rounded-lg border border-border bg-input px-4 py-3
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring
              ${icon ? "pl-12" : ""}
              ${isPassword ? "pr-12" : ""}
              ${error ? "border-destructive" : ""}
              ${className}
            `}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
