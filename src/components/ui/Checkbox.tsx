"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked, ...props }, ref) => {
    return (
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            className="sr-only"
            {...props}
          />
          <div
            className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${
              checked
                ? "bg-primary border-primary"
                : "bg-input border-border group-hover:border-muted-foreground"
            }`}
          >
            <Check
              size={14}
              className={`text-primary-foreground transition-opacity ${
                checked ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
        {label && (
          <span className="text-sm text-muted-foreground leading-tight">
            {label}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
