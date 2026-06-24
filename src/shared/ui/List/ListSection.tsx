import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

export function ListSection({
  title,
  children,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2", className)}>
      {title ? <h2 className="px-1 text-xs font-medium text-text-tertiary">{title}</h2> : null}
      <div className="overflow-hidden rounded-md border border-border-solid-line-2 bg-background-primary-container shadow-card">
        {children}
      </div>
    </section>
  );
}
