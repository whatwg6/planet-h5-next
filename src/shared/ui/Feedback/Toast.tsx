import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

const toneClassName = {
  success: "bg-functional-brand-background text-functional-brand-foreground",
  error: "bg-functional-error-background text-functional-error-foreground",
  info: "bg-background-components text-text-secondary",
};

export function Toast({
  tone = "info",
  children,
}: {
  tone?: keyof typeof toneClassName;
  children: ReactNode;
}) {
  return (
    <div role="status" className={cn("rounded-md px-3 py-2 text-sm", toneClassName[tone])}>
      {children}
    </div>
  );
}
