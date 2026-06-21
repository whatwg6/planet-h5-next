import { useRouter } from "@tanstack/react-router";

import { useMerchantDetailQuery } from "@/features/merchant/queries/useMerchantDetailQuery";
import { InfoRow } from "@/shared/ui/DataDisplay";
import { ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Page } from "@/shared/ui/Page";

export function MerchantDetailView({ merchantId }: { merchantId: string }) {
  const router = useRouter();
  const query = useMerchantDetailQuery(merchantId);

  if (query.isLoading)
    return (
      <Page title="商户详情" onBack={() => router.history.back()}>
        <LoadingState />
      </Page>
    );
  if (query.isError || !query.data)
    return (
      <Page title="商户详情" onBack={() => router.history.back()}>
        <ErrorState title="加载失败" onRetry={() => query.refetch()} />
      </Page>
    );

  return (
    <Page title="商户详情" onBack={() => router.history.back()}>
      <div className="rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 shadow-card">
        <InfoRow label="名称" value={query.data.name} />
        {query.data.city ? <InfoRow label="城市" value={query.data.city} /> : null}
        {Object.entries(query.data.fields).map(([key, value]) => (
          <InfoRow key={key} label={key} value={value} />
        ))}
      </div>
    </Page>
  );
}
