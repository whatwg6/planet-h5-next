import type { ClientDetail } from "@/domain/client/Client";
import { Button } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

import { ClientDetailReadView } from "./ClientDetailReadView";

export function ClientDetailView({
  client,
  onBack,
  onEdit,
}: {
  client: ClientDetail;
  onBack: () => void;
  onEdit: () => void;
}) {
  return (
    <Page
      title="客户详情"
      onBack={onBack}
      footer={
        <Button className="w-full" onClick={onEdit}>
          编辑
        </Button>
      }
    >
      <div className="space-y-4">
        <ClientDetailReadView client={client} />
      </div>
    </Page>
  );
}
