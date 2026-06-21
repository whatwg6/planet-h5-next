import { useEffect, useState } from "react";

import type { ClientDetail } from "@/domain/client/Client";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { useClientDetailUiStore } from "@/features/client/store/clientDetailUiStore";
import { ConfirmDialog } from "@/shared/ui/Feedback";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

type ClientDetailEditController = {
  confirmDiscardOpen: boolean;
  isSaving: boolean;
  name: string;
  cancelEdit: () => void;
  closeConfirm: () => void;
  confirmCancel: () => void;
  save: () => void;
  setName: (name: string) => void;
};

function useClientDetailEditController(
  client: ClientDetail,
  { onClose }: { onClose: () => void },
): ClientDetailEditController {
  const mutation = useUpdateClientMutation();
  const { isDirty, confirmDiscardOpen, resetEditState, setDirty, requestCancel, closeConfirm } = useClientDetailUiStore();
  const [name, setNameState] = useState(client.name);

  useEffect(() => {
    setNameState(client.name);
  }, [client.id, client.name]);

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

  const save = () => {
    mutation.mutate({ clientId: client.id, values: { ...client.fields, name } }, { onSuccess: closeEdit });
  };

  return {
    confirmDiscardOpen,
    isSaving: mutation.isPending,
    name,
    cancelEdit,
    closeConfirm,
    confirmCancel: closeEdit,
    save,
    setName,
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
      title="客户详情"
      onBack={controller.cancelEdit}
      footer={<ClientDetailEditFooter controller={controller} />}
    >
      <div className="space-y-4">
        <Field
          label="名称"
          value={controller.name}
          onChange={(event) => controller.setName(event.target.value)}
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
      <Button variant="secondary" onClick={controller.cancelEdit}>取消</Button>
      <Button disabled={controller.isSaving} onClick={controller.save}>保存</Button>
    </div>
  );
}
