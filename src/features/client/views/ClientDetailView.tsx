import { useState } from "react";
import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";

import { clientDetailEditingState, getClientDetailRouteMode } from "@/app/router/historyState";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { useClientDetailQuery } from "@/features/client/queries/useClientDetailQuery";
import { useClientDetailUiStore } from "@/features/client/store/clientDetailUiStore";
import { InfoRow } from "@/shared/ui/DataDisplay";
import { ConfirmDialog, ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

export function ClientDetailView({ clientId }: { clientId: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const mode = useRouterState({ select: (state) => getClientDetailRouteMode(state.location.state) });
  const query = useClientDetailQuery(clientId);
  const mutation = useUpdateClientMutation();
  const { isDirty, confirmDiscardOpen, resetEditState, setDirty, requestCancel, closeConfirm } = useClientDetailUiStore();
  const [name, setName] = useState("");

  const leaveEdit = () => {
    resetEditState();
    router.history.back();
  };

  if (query.isLoading) return <Page title="客户详情"><LoadingState /></Page>;
  if (query.isError || !query.data) return <Page title="客户详情"><ErrorState title="加载失败" onRetry={() => query.refetch()} /></Page>;

  const client = query.data;
  const currentName = name || client.name;
  const enterEdit = () => {
    setName(client.name);
    resetEditState();
    void navigate({
      to: "/client/$clientId",
      params: { clientId },
      state: (state) => ({ ...state, ...clientDetailEditingState }),
    });
  };
  const cancelEdit = () => {
    if (isDirty) {
      requestCancel();
      return;
    }

    leaveEdit();
  };

  return (
    <Page
      title="客户详情"
      footer={
        mode === "editing" ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={cancelEdit}>取消</Button>
            <Button
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ clientId, values: { ...client.fields, name: currentName } }, { onSuccess: leaveEdit })}
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
              if (!isDirty) setDirty(true);
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
      <ConfirmDialog open={confirmDiscardOpen} title="确认放弃更改？" onCancel={closeConfirm} onConfirm={leaveEdit} />
    </Page>
  );
}
