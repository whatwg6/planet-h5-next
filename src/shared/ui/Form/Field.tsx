import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: ReactNode;
};

export function Field({ label, error, className, ...props }: FieldProps) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input className={cn("h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-brand", className)} {...props} />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
