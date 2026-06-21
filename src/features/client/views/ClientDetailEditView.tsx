import { useEffect, useState } from "react";

import type { ClientDetail } from "@/domain/client/Client";
import { validateClientName, validateClientRemark } from "@/domain/client/clientRules";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { useClientDetailUiStore } from "@/features/client/store/clientDetailUiStore";
import { ConfirmDialog } from "@/shared/ui/Feedback";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

type ClientDetailEditController = {
  confirmDiscardOpen: boolean;
  isSaving: boolean;
  name: string;
  remark: string;
  cancelEdit: () => void;
  closeConfirm: () => void;
  confirmCancel: () => void;
  nameError?: string;
  remarkError?: string;
  save: () => void;
  setName: (name: string) => void;
  setRemark: (remark: string) => void;
};

function useClientDetailEditController(
  client: ClientDetail,
  { onClose }: { onClose: () => void },
): ClientDetailEditController {
  const mutation = useUpdateClientMutation();
  const { isDirty, confirmDiscardOpen, resetEditState, setDirty, requestCancel, closeConfirm } =
    useClientDetailUiStore();
  const [name, setNameState] = useState(client.name);
  const [remark, setRemarkState] = useState(client.remark ?? "");
  const nameError = validateClientName(name);
  const remarkError = validateClientRemark(remark);

  useEffect(() => {
    setNameState(client.name);
    setRemarkState(client.remark ?? "");
  }, [client.id, client.name, client.remark]);

  const closeEdit = () => {
    resetEditState();
    onClose();
  };

  const cancelEdit = () => {
    if (isDirty) {
      requestCancel();
      return;
    }

    closeEdit();
  };

  const setName = (nextName: string) => {
    setNameState(nextName);
    if (!isDirty) setDirty(true);
  };

  const setRemark = (nextRemark: string) => {
    setRemarkState(nextRemark);
    if (!isDirty) setDirty(true);
  };

  const save = () => {
    if (nameError || remarkError) return;
    mutation.mutate({ clientId: client.id, values: { name, remark } }, { onSuccess: closeEdit });
  };

  return {
    confirmDiscardOpen,
    isSaving: mutation.isPending,
    name,
    remark,
    cancelEdit,
    closeConfirm,
    confirmCancel: closeEdit,
    nameError,
    remarkError,
    save,
    setName,
    setRemark,
  };
}

export function ClientDetailEditView({
  client,
  onClose,
}: {
  client: ClientDetail;
  onClose: () => void;
}) {
  const controller = useClientDetailEditController(client, { onClose });

  return (
    <Page
      title="编辑名称与备注"
      onBack={controller.cancelEdit}
      footer={<ClientDetailEditFooter controller={controller} />}
    >
      <div className="space-y-4">
        <Field
          label="名称"
          value={controller.name}
          error={controller.nameError}
          onChange={(event) => controller.setName(event.target.value)}
        />
        <Field
          label="备注"
          value={controller.remark}
          error={controller.remarkError}
          onChange={(event) => controller.setRemark(event.target.value)}
          placeholder="请输入备注"
        />
      </div>
      <ConfirmDialog
        open={controller.confirmDiscardOpen}
        title="确认放弃更改？"
        onCancel={controller.closeConfirm}
        onConfirm={controller.confirmCancel}
      />
    </Page>
  );
}

function ClientDetailEditFooter({ controller }: { controller: ClientDetailEditController }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="secondary" onClick={controller.cancelEdit}>
        取消
      </Button>
      <Button
        disabled={controller.isSaving || Boolean(controller.nameError || controller.remarkError)}
        onClick={controller.save}
      >
        保存
      </Button>
    </div>
  );
}
