import { useEffect, useState } from "react";

import type { ClientDetail } from "@/domain/client/Client";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { SelectMcStaff } from "@/features/mc-staff/components/SelectMcStaff";
import { Page } from "@/shared/ui/Page";
import { Button } from "@/shared/ui/Form";

export function ClientManagerSettingsView({
  client,
  onBack,
}: {
  client: ClientDetail;
  onBack: () => void;
}) {
  const mutation = useUpdateClientMutation();
  const initialManagers = client.settingDetails?.managers ?? [];
  const [managers, setManagers] = useState(initialManagers);

  useEffect(() => {
    setManagers(initialManagers);
  }, [client.id, initialManagers]);

  const save = () => {
    mutation.mutate({ clientId: client.id, values: { managers } }, { onSuccess: onBack });
  };

  return (
    <Page
      title="管理权限"
      onBack={onBack}
      footer={
        <Button disabled={mutation.isPending || managers.length === 0} onClick={save}>
          保存
        </Button>
      }
    >
      <div className="space-y-3">
        <p className="rounded-md bg-background-secondary-container px-3 py-2 text-sm leading-6 text-text-secondary">
          以下 {managers.length}{" "}
          个用户可在客户列表中看到该客户，并拥有管理客户及全部用餐计划的权限。
        </p>
        <SelectMcStaff
          defaultSelected={managers.map((manager) => ({
            id: manager.id,
            displayName: manager.name,
            email: manager.email,
          }))}
          onSelect={(selectedStaffs) => {
            setManagers((current) => [
              ...current,
              ...selectedStaffs
                .filter(
                  (staff) =>
                    !current.some(
                      (manager) => manager.email.toLowerCase() === staff.email.toLowerCase(),
                    ),
                )
                .map((staff) => ({
                  id: staff.id,
                  name: staff.displayName,
                  email: staff.email,
                })),
            ]);
          }}
        />
        <div className="overflow-hidden rounded-md border border-border-solid-line-2 bg-background-primary-container shadow-card">
          {managers.map((manager) => (
            <div
              key={manager.id}
              className="flex items-center justify-between gap-3 border-b border-border-solid-line-2 px-3 py-4 last:border-b-0"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-text-primary">{manager.name}</span>
                <span className="mt-1 block text-xs text-text-secondary">{manager.email}</span>
              </span>
              <button
                type="button"
                className="shrink-0 text-sm text-functional-error-foreground"
                onClick={() =>
                  setManagers((current) => current.filter((item) => item.id !== manager.id))
                }
              >
                移除
              </button>
            </div>
          ))}
        </div>
        {mutation.isError ? (
          <p className="text-sm text-functional-error-foreground">{mutation.error.message}</p>
        ) : null}
      </div>
    </Page>
  );
}
