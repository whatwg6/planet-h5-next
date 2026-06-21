import { useEffect, useState } from "react";

import type { ClientCostCenter, ClientDetail } from "@/domain/client/Client";
import { validateClientCostCenters } from "@/domain/client/clientRules";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

const emptyCostCenters: ClientCostCenter[] = [];

export function ClientCostCenterSettingsView({
  client,
  onBack,
}: {
  client: ClientDetail;
  onBack: () => void;
}) {
  const mutation = useUpdateClientMutation();
  const costCenters = client.settingDetails?.costCenters ?? emptyCostCenters;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ClientCostCenter[]>(costCenters);

  useEffect(() => {
    setDraft(costCenters);
    setIsEditing(false);
  }, [client.id, costCenters]);

  const error = isEditing ? validateClientCostCenters(draft) : undefined;

  const updateName = (id: string, name: string) => {
    setDraft((current) =>
      current.map((costCenter) => (costCenter.id === id ? { ...costCenter, name } : costCenter)),
    );
  };

  const addCostCenter = () => {
    setDraft((current) => [
      ...current,
      {
        id: `local-cost-center-${current.length + 1}`,
        name: "",
      },
    ]);
  };

  const removeCostCenter = (id: string) => {
    setDraft((current) => current.filter((costCenter) => costCenter.id !== id));
  };

  const cancel = () => {
    setDraft(costCenters);
    setIsEditing(false);
  };

  const save = () => {
    if (error) return;
    mutation.mutate(
      { clientId: client.id, values: { costCenters: draft } },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  return (
    <Page
      title="成本中心"
      onBack={onBack}
      footer={
        isEditing ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={cancel}>
              取消
            </Button>
            <Button disabled={mutation.isPending || Boolean(error)} onClick={save}>
              保存
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <p className="rounded-md bg-background-secondary-container px-3 py-2 text-sm leading-6 text-text-secondary">
          成本中心用于成员消费归集。停用项保留展示，不能在本基础切片编辑。
        </p>
        {error ? <p className="text-sm text-functional-error-foreground">{error}</p> : null}
        {mutation.isError ? (
          <p className="text-sm text-functional-error-foreground">{mutation.error.message}</p>
        ) : null}
        {draft.length > 0 ? (
          <div className="space-y-2">
            {draft.map((costCenter) =>
              isEditing && !costCenter.disabled ? (
                <div
                  key={costCenter.id}
                  className="rounded-md border border-border-solid-line-2 bg-background-primary-container p-3 shadow-card"
                >
                  <Field
                    label="成本中心名称"
                    value={costCenter.name}
                    error={costCenter.name.trim() ? undefined : "成本中心名称不能为空"}
                    onChange={(event) => updateName(costCenter.id, event.target.value)}
                  />
                  <Button
                    variant="ghost"
                    className="mt-2 w-full text-functional-error-foreground"
                    onClick={() => removeCostCenter(costCenter.id)}
                  >
                    删除
                  </Button>
                </div>
              ) : (
                <div
                  key={costCenter.id}
                  className="rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 py-4 shadow-card"
                >
                  <div className="text-sm font-medium text-text-primary">{costCenter.name}</div>
                  {costCenter.disabled ? (
                    <div className="mt-1 text-xs text-text-secondary">已停用，不可编辑</div>
                  ) : null}
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border-solid-line-2 px-3 py-8 text-center text-sm text-text-secondary">
            暂无成本中心。
          </p>
        )}
        {isEditing ? (
          <Button variant="secondary" className="w-full" onClick={addCostCenter}>
            添加成本中心
          </Button>
        ) : (
          <Button className="w-full" onClick={() => setIsEditing(true)}>
            编辑成本中心
          </Button>
        )}
      </div>
    </Page>
  );
}
