import type { ReactNode } from "react";

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 text-sm last:border-b-0">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="text-right text-ink">{value}</span>
    </div>
  );
}
