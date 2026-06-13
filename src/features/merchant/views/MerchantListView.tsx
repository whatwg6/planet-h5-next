import { Link } from "@tanstack/react-router";

import { useMerchantListQuery } from "@/features/merchant/queries/useMerchantListQuery";
import { useMerchantListStore } from "@/features/merchant/store/merchantListStore";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

export function MerchantListView() {
  const keyword = useMerchantListStore((state) => state.keyword);
  const setKeyword = useMerchantListStore((state) => state.setKeyword);
  const query = useMerchantListQuery({ keyword });

  return (
    <Page title="商户列表">
      <div className="space-y-4">
        <Field label="搜索" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="输入名称或城市" />
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? <ErrorState title="加载失败" onRetry={() => query.refetch()} /> : null}
        {query.data?.length === 0 ? <EmptyState title="暂无数据" /> : null}
        <div className="space-y-2">
          {query.data?.map((merchant) => (
            <Link key={merchant.id} to="/merchant/$merchantId" params={{ merchantId: merchant.id }} className="block rounded-md border border-line bg-white p-3">
              <div className="font-medium">{merchant.name}</div>
              <div className="mt-1 text-sm text-muted">{merchant.city}</div>
            </Link>
          ))}
        </div>
      </div>
    </Page>
  );
}
