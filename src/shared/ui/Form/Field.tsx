import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: ReactNode;
};

export function Field({ label, error, className, ...props }: FieldProps) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <input
        className={cn(
          "h-10 w-full rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 text-sm outline-none transition-colors",
          "placeholder:text-text-tertiary focus:border-functional-brand-foreground focus:ring-2 focus:ring-functional-brand-transparent",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-functional-error-foreground">{error}</span> : null}
    </label>
  );
}
