import { Link } from "@tanstack/react-router";

import { useClientListQuery } from "@/features/client/queries/useClientListQuery";
import { useClientListStore } from "@/features/client/store/clientListStore";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

export function ClientListView() {
  const { keyword, setKeyword } = useClientListStore();
  const query = useClientListQuery({ keyword });

  return (
    <Page title="客户列表">
      <div className="space-y-4">
        <Field label="搜索" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="输入名称或电话" />
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? <ErrorState title="加载失败" onRetry={() => query.refetch()} /> : null}
        {query.data?.length === 0 ? <EmptyState title="暂无数据" /> : null}
        <div className="space-y-2">
          {query.data?.map((client) => (
            <Link key={client.id} to="/client/$clientId" params={{ clientId: client.id }} className="block rounded-md border border-line bg-white p-3">
              <div className="font-medium">{client.name}</div>
              <div className="mt-1 text-sm text-muted">{client.phone}</div>
            </Link>
          ))}
        </div>
      </div>
    </Page>
  );
}
