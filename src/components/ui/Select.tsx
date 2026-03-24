"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={selectId} className="text-xs text-muted-foreground uppercase tracking-wider">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={`
              w-full appearance-none rounded-lg border border-border bg-input px-4 py-3
              text-foreground
              focus:outline-none focus:ring-2 focus:ring-ring
              ${error ? "border-destructive" : ""}
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={20}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>

        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
