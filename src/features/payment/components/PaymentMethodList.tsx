import { usePaymentMethodsQuery } from "@/features/payment/queries/usePaymentMethodsQuery";
import { ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { ListRow, ListSection } from "@/shared/ui/List";

export function PaymentMethodList({
  clientId,
  selectedIds,
  onChange,
}: {
  clientId: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const query = usePaymentMethodsQuery(clientId);

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState title="支付方式加载失败" onRetry={() => query.refetch()} />;

  return (
    <ListSection title="支付方式">
      {(query.data ?? []).map((method) => (
        <ListRow
          key={method.id}
          title={method.name}
          description={method.description}
          value={selectedIds.includes(method.id) ? "已选择" : method.enabled ? "可选" : "未开通"}
          disabled={!method.enabled}
          onClick={() => {
            if (!method.enabled) return;
            onChange(
              selectedIds.includes(method.id)
                ? selectedIds.filter((id) => id !== method.id)
                : [...selectedIds, method.id],
            );
          }}
        />
      ))}
    </ListSection>
  );
}
