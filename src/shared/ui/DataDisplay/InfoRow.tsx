import type { ReactNode } from "react";

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-solid-line-2 py-3 text-sm last:border-b-0">
      <span className="shrink-0 text-text-secondary">{label}</span>
      <span className="text-right text-text-primary">{value}</span>
    </div>
  );
}
