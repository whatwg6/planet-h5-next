import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-brand-transparent focus-visible:ring-offset-2 focus-visible:ring-offset-background-base",
        variant === "primary" && "bg-functional-brand-background text-brand-foreground shadow-sm active:bg-functional-brand-background--active",
        variant === "secondary" && "border border-border-solid-line-2 bg-background-primary-container text-text-primary active:bg-background-primary-container--active",
        variant === "ghost" && "bg-transparent text-text-primary active:bg-functional-brand-transparent",
        variant === "danger" && "bg-functional-error-background text-brand-foreground shadow-sm active:bg-functional-error-background--active",
        className,
      )}
      {...props}
    />
  );
}
