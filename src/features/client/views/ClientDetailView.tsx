import { useRouter, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { useClientDetailQuery } from "@/features/client/queries/useClientDetailQuery";
import { InfoRow } from "@/shared/ui/DataDisplay";
import { ConfirmDialog, ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

export function ClientDetailView({ clientId }: { clientId: string }) {
  const router = useRouter();
  const location = useRouterState({ select: (s) => s.location });
  const mode = ((location.state as unknown) as Record<string, unknown> | undefined)?.mode === "editing" ? "editing" : "readonly";

  const query = useClientDetailQuery(clientId);
  const mutation = useUpdateClientMutation();
  const [name, setName] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const enterEdit = () => {
    setName(query.data?.name ?? "");
    setIsDirty(false);
    setConfirmDiscardOpen(false);
    router.navigate({ to: "/client/$clientId", params: { clientId }, state: { mode: "editing" } as any });
  };

  const exitEdit = () => {
    router.history.back();
  };

  const handleCancel = () => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
    } else {
      exitEdit();
    }
  };

  if (query.isLoading) return <Page title="客户详情"><LoadingState /></Page>;
  if (query.isError || !query.data) return <Page title="客户详情"><ErrorState title="加载失败" onRetry={() => query.refetch()} /></Page>;

  const client = query.data;
  const currentName = name || client.name;

  return (
    <Page
      title="客户详情"
      footer={
        mode === "editing" ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={handleCancel}>取消</Button>
            <Button
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ clientId, values: { ...client.fields, name: currentName } }, { onSuccess: exitEdit })}
            >
              保存
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={enterEdit}>编辑</Button>
        )
      }
    >
      <div className="space-y-4">
        {mode === "editing" ? (
          <Field
            label="名称"
            value={currentName}
            onChange={(event) => {
              setName(event.target.value);
              if (!isDirty) setIsDirty(true);
            }}
          />
        ) : (
          <div className="rounded-md bg-white px-3">
            <InfoRow label="名称" value={client.name} />
            {client.phone ? <InfoRow label="电话" value={client.phone} /> : null}
            {Object.entries(client.fields).map(([key, value]) => <InfoRow key={key} label={key} value={value} />)}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmDiscardOpen}
        title="确认放弃更改？"
        onCancel={() => setConfirmDiscardOpen(false)}
        onConfirm={exitEdit}
      />
    </Page>
  );
}
