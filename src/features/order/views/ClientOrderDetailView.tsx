import {
  buildPriceSummaryRows,
  formatMerchantOrderStatus,
  formatOrderDateTime,
  formatOrderMoney,
  formatOrderStatus,
  getDisplayScheduleNodes,
} from "@/domain/order/orderRules";
import { useClientOrderDetailQuery } from "@/features/order/queries/useClientOrderDetailQuery";
import { Button } from "@/shared/ui/Form";
import { InfoRow } from "@/shared/ui/DataDisplay";
import { ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Page } from "@/shared/ui/Page";

import type { ParsedOrderParams } from "@/domain/order/Order";

export function ClientOrderDetailView({
  clientId,
  planId,
  orderParams,
  onBack,
  onOpenMemberOrders,
}: {
  clientId: string;
  planId: string;
  orderParams: ParsedOrderParams;
  onBack: () => void;
  onOpenMemberOrders: () => void;
}) {
  const query = useClientOrderDetailQuery(clientId, planId, orderParams);

  if (query.isLoading)
    return (
      <Page title="订单详情" onBack={onBack}>
        <LoadingState />
      </Page>
    );

  if (query.isError || !query.data)
    return (
      <Page title="订单详情" onBack={onBack}>
        <ErrorState title="加载失败" onRetry={() => query.refetch()} />
      </Page>
    );

  const scheduleNodes = getDisplayScheduleNodes({
    hasOrderNo: Boolean(orderParams.orderNo),
    scheduleNodes: query.data.scheduleNodes,
    defaultScheduleNodes: query.data.defaultScheduleNodes,
  });

  return (
    <Page title={`${formatOrderDateTime(orderParams.time).slice(0, 10)} 订单`} onBack={onBack}>
      <div className="space-y-4">
        <section className="rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 shadow-card">
          <InfoRow label="订单状态" value={formatOrderStatus(query.data.status)} />
          <InfoRow label="订单编号" value={query.data.orderNo ?? "待生成"} />
          <InfoRow label="成员数" value={`${query.data.memberCount} 位`} />
          <InfoRow label="总份数" value={`${query.data.productCount} 份`} />
        </section>

        <section className="rounded-md border border-border-solid-line-2 bg-background-primary-container p-3 shadow-card">
          <h2 className="mb-3 text-sm font-medium text-text-primary">点餐时段</h2>
          <div className="space-y-3">
            {scheduleNodes.map((node) => (
              <div key={node.id} className="rounded-md bg-background-components p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-text-secondary">截止下单</span>
                  <span>{formatOrderDateTime(node.orderDeadline)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-text-secondary">取餐时间</span>
                  <span>{formatOrderDateTime(node.mealTime)}</span>
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                  {node.merchants.map((merchant) => merchant.name).join("、")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-border-solid-line-2 bg-background-primary-container p-3 shadow-card">
          <h2 className="mb-3 text-sm font-medium text-text-primary">价格摘要</h2>
          <div className="space-y-2">
            {buildPriceSummaryRows(query.data.priceSummary).map((row) => (
              <div
                key={row.label}
                className={
                  row.variant === "primary"
                    ? "flex items-center justify-between text-sm font-medium"
                    : "flex items-center justify-between text-sm text-text-secondary"
                }
              >
                <span>{row.variant === "secondary" ? `┗ ${row.label}` : row.label}</span>
                <span>
                  {row.mealPointCount ? `${row.mealPointCount} 点 ` : ""}
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <Button className="mt-3 w-full" variant="secondary" onClick={onOpenMemberOrders}>
            查看总订单
          </Button>
        </section>

        <section className="space-y-2">
          {query.data.merchantSummaries.map((merchant) => (
            <button
              key={merchant.merchantId}
              className="w-full rounded-md border border-border-solid-line-2 bg-background-primary-container p-3 text-left text-sm shadow-card"
              onClick={onOpenMemberOrders}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{merchant.merchantName}</span>
                <span>{merchant.productCount} 份</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-text-secondary">
                <span>{formatMerchantOrderStatus(merchant.status)}</span>
                <span>{formatOrderMoney(merchant.amountCents)}</span>
              </div>
            </button>
          ))}
        </section>
      </div>
    </Page>
  );
}
