import { useEffect, useState } from "react";

import type { ClientDepartment, ClientDetail } from "@/domain/client/Client";
import { validateClientDepartments } from "@/domain/client/clientRules";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

const emptyDepartments: ClientDepartment[] = [];

export function ClientDepartmentSettingsView({
  client,
  onBack,
}: {
  client: ClientDetail;
  onBack: () => void;
}) {
  const mutation = useUpdateClientMutation();
  const departments = client.settingDetails?.departments ?? emptyDepartments;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ClientDepartment[]>(departments);

  useEffect(() => {
    setDraft(departments);
    setIsEditing(false);
  }, [client.id, departments]);

  const error = isEditing ? validateClientDepartments(draft) : undefined;
  const manualDepartments = draft.filter((department) => department.source === "manual");
  const thirdPartyDepartments = draft.filter((department) => department.source === "thirdParty");

  const updateName = (id: string, name: string) => {
    setDraft((current) =>
      current.map((department) => (department.id === id ? { ...department, name } : department)),
    );
  };

  const addDepartment = () => {
    setDraft((current) => [
      ...current,
      {
        id: `local-department-${current.length + 1}`,
        name: "",
        source: "manual",
      },
    ]);
  };

  const removeDepartment = (id: string) => {
    setDraft((current) => current.filter((department) => department.id !== id));
  };

  const cancel = () => {
    setDraft(departments);
    setIsEditing(false);
  };

  const save = () => {
    if (error) return;
    mutation.mutate(
      { clientId: client.id, values: { departments: draft } },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  return (
    <Page
      title="部门"
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
          手动创建的部门可编辑；从第三方平台同步的部门只读。
        </p>
        {error ? <p className="text-sm text-functional-error-foreground">{error}</p> : null}
        {mutation.isError ? (
          <p className="text-sm text-functional-error-foreground">{mutation.error.message}</p>
        ) : null}
        <DepartmentSection
          title="手动创建的部门"
          departments={manualDepartments}
          isEditing={isEditing}
          onNameChange={updateName}
          onRemove={removeDepartment}
        />
        <DepartmentSection
          title="从第三方平台同步的部门"
          departments={thirdPartyDepartments}
          isEditing={false}
        />
        {manualDepartments.length === 0 && !isEditing ? (
          <p className="rounded-md border border-dashed border-border-solid-line-2 px-3 py-8 text-center text-sm text-text-secondary">
            暂无手动创建的部门。
          </p>
        ) : null}
        {isEditing ? (
          <Button variant="secondary" className="w-full" onClick={addDepartment}>
            添加部门
          </Button>
        ) : (
          <Button className="w-full" onClick={() => setIsEditing(true)}>
            编辑手动部门
          </Button>
        )}
      </div>
    </Page>
  );
}

function DepartmentSection({
  title,
  departments,
  isEditing,
  onNameChange,
  onRemove,
}: {
  title: string;
  departments: ClientDepartment[];
  isEditing: boolean;
  onNameChange?: (id: string, name: string) => void;
  onRemove?: (id: string) => void;
}) {
  if (departments.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-xs font-medium text-text-tertiary">{title}</h2>
      <div className="space-y-2">
        {departments.map((department) =>
          isEditing ? (
            <div
              key={department.id}
              className="rounded-md border border-border-solid-line-2 bg-background-primary-container p-3 shadow-card"
            >
              <Field
                label="部门名称"
                value={department.name}
                error={department.name.trim() ? undefined : "部门名称不能为空"}
                onChange={(event) => onNameChange?.(department.id, event.target.value)}
              />
              <Button
                variant="ghost"
                className="mt-2 w-full text-functional-error-foreground"
                onClick={() => onRemove?.(department.id)}
              >
                删除
              </Button>
            </div>
          ) : (
            <div
              key={department.id}
              className="rounded-md border border-border-solid-line-2 bg-background-primary-container px-3 py-4 shadow-card"
            >
              <div className="text-sm font-medium text-text-primary">{department.name}</div>
              {department.disabled ? (
                <div className="mt-1 text-xs text-text-secondary">第三方同步，不可编辑</div>
              ) : null}
            </div>
          ),
        )}
      </div>
    </section>
  );
}
