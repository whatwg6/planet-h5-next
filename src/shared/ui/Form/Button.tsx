import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium disabled:opacity-50",
        variant === "primary" && "bg-brand text-white",
        variant === "secondary" && "border border-line bg-white text-ink",
        variant === "ghost" && "bg-transparent text-ink",
        variant === "danger" && "bg-danger text-white",
        className,
      )}
      {...props}
    />
  );
}
