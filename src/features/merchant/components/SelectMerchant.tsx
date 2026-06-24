import { useState } from "react";

import { useMerchantListQuery } from "@/features/merchant/queries/useMerchantListQuery";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Field } from "@/shared/ui/Form";
import { ListRow, ListSection } from "@/shared/ui/List";

export function SelectMerchant({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const query = useMerchantListQuery({ keyword });

  return (
    <section className="space-y-3">
      <Field
        label="搜索商户"
        placeholder="输入名称或城市"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState title="商户加载失败" onRetry={() => query.refetch()} /> : null}
      {query.isSuccess && query.data.length === 0 ? <EmptyState title="暂无商户结果" /> : null}
      {query.isSuccess && query.data.length > 0 ? (
        <ListSection title="商户">
          {query.data.map((merchant) => (
            <ListRow
              key={merchant.id}
              title={merchant.name}
              description={merchant.city}
              value={selectedIds.includes(merchant.id) ? "已选择" : "可选"}
              onClick={() =>
                onChange(
                  selectedIds.includes(merchant.id)
                    ? selectedIds.filter((id) => id !== merchant.id)
                    : [...selectedIds, merchant.id],
                )
              }
            />
          ))}
        </ListSection>
      ) : null}
    </section>
  );
}
