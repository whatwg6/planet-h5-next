import type { ClientDetail } from "@/domain/client/Client";
import { InfoRow } from "@/shared/ui/DataDisplay";

export function ClientDetailReadView({ client }: { client: ClientDetail }) {
  return (
    <div className="rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 shadow-card">
      <InfoRow label="名称" value={client.name} />
      {client.phone ? <InfoRow label="电话" value={client.phone} /> : null}
      {Object.entries(client.fields).map(([key, value]) => <InfoRow key={key} label={key} value={value} />)}
    </div>
  );
}
