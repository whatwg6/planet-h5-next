import { Link } from "@tanstack/react-router";

import { ClientCard } from "@/features/client/components/ClientCard";
import { useClientListQuery } from "@/features/client/queries/useClientListQuery";
import { useClientListStore } from "@/features/client/store/clientListStore";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

export function ClientListView() {
  const { keyword, setKeyword } = useClientListStore();
  const query = useClientListQuery({ keyword });

  return (
    <Page title="4.0 客户">
      <div className="space-y-4">
        <Field
          label="搜索"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="输入名称或电话"
        />
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? <ErrorState title="加载失败" onRetry={() => query.refetch()} /> : null}
        {query.data?.length === 0 ? <EmptyState title="暂无数据" /> : null}
        <div className="space-y-3">
          {query.data?.map((client) => (
            <Link
              key={client.id}
              to="/ops/client/$clientId"
              params={{ clientId: client.id }}
              className="block text-text-primary"
            >
              <ClientCard
                name={client.name}
                phone={client.phone}
                isDeveloperTest={client.isDeveloperTest}
              />
            </Link>
          ))}
        </div>
      </div>
    </Page>
  );
}
