import type { ClientDetail } from "@/domain/client/Client";
import { InfoRow } from "@/shared/ui/DataDisplay";
import { Button } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

export function ClientNameAndRemarkView({
  client,
  onBack,
  onEdit,
}: {
  client: ClientDetail;
  onBack: () => void;
  onEdit: () => void;
}) {
  return (
    <Page title="名称与备注" onBack={onBack}>
      <div className="space-y-4">
        <div className="rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 shadow-card">
          <InfoRow label="名称" value={client.name} />
          <InfoRow label="备注" value={client.remark || "无"} />
        </div>
        <Button onClick={onEdit}>编辑</Button>
      </div>
    </Page>
  );
}
