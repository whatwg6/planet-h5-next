import { formatOrderMoney, formatOrderStatus } from "@/domain/order/orderRules";
import { useClientMemberOrderListQuery } from "@/features/order/queries/useClientMemberOrderListQuery";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Page } from "@/shared/ui/Page";

import type { ParsedOrderParams } from "@/domain/order/Order";

export function ClientMemberOrderListView({
  clientId,
  planId,
  orderParams,
  onBack,
}: {
  clientId: string;
  planId: string;
  orderParams: ParsedOrderParams;
  onBack: () => void;
}) {
  const query = useClientMemberOrderListQuery(clientId, planId, orderParams);

  if (query.isLoading)
    return (
      <Page title="成员订单" onBack={onBack}>
        <LoadingState />
      </Page>
    );

  if (query.isError || !query.data)
    return (
      <Page title="成员订单" onBack={onBack}>
        <ErrorState title="加载失败" onRetry={() => query.refetch()} />
      </Page>
    );

  const totalCount = query.data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Page title="成员订单" onBack={onBack}>
      <div className="space-y-3">
        <div className="rounded-md border border-border-solid-line-2 bg-background-primary-container p-3 text-sm text-text-secondary">
          {query.data.length} 位成员，{totalCount} 份
        </div>
        {query.data.length === 0 ? <EmptyState title="暂无成员订单" /> : null}
        {query.data.map((item) => (
          <article
            key={item.id}
            className="rounded-md border border-border-solid-line-2 bg-background-primary-container p-3 text-sm shadow-card"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-medium text-text-primary">{item.memberName}</h2>
              <span>{item.count} 份</span>
            </div>
            <p className="mt-1 text-text-secondary">{item.contact}</p>
            <div className="mt-3 rounded-md bg-background-components p-3">
              <div className="flex items-center justify-between gap-3">
                <span>{item.productName}</span>
                <span>{formatOrderMoney(item.amountCents)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-text-secondary">
                <span>{item.merchantName}</span>
                <span>{formatOrderStatus(item.status)}</span>
              </div>
              {item.refundCount > 0 ? (
                <p className="mt-2 text-functional-warning-foreground">
                  售后 {item.refundCount} 份
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </Page>
  );
}
