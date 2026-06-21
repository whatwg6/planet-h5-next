import { useEffect, useState } from "react";

import type { ClientDetail } from "@/domain/client/Client";
import { useUpdateClientMutation } from "@/features/client/mutations/useUpdateClientMutation";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

const emptySupportSetting = {
  contactName: "",
  contactPhone: "",
};

export function ClientSupportSettingsView({
  client,
  onBack,
}: {
  client: ClientDetail;
  onBack: () => void;
}) {
  const mutation = useUpdateClientMutation();
  const initialSupport = client.settingDetails?.support ?? emptySupportSetting;
  const [contactName, setContactName] = useState(initialSupport.contactName);
  const [contactPhone, setContactPhone] = useState(initialSupport.contactPhone);

  useEffect(() => {
    setContactName(initialSupport.contactName);
    setContactPhone(initialSupport.contactPhone);
  }, [client.id, initialSupport.contactName, initialSupport.contactPhone]);

  const nameError = contactName.trim() ? undefined : "客服名称不能为空";
  const phoneError = contactPhone.trim() ? undefined : "联系电话不能为空";
  const hasError = Boolean(nameError || phoneError);

  const save = () => {
    if (hasError) return;
    mutation.mutate(
      {
        clientId: client.id,
        values: {
          support: {
            contactName: contactName.trim(),
            contactPhone: contactPhone.trim(),
          },
        },
      },
      { onSuccess: onBack },
    );
  };

  return (
    <Page
      title="客户支持"
      onBack={onBack}
      footer={
        <Button disabled={mutation.isPending || hasError} onClick={save}>
          保存
        </Button>
      }
    >
      <div className="space-y-4">
        <Field
          label="客服名称"
          value={contactName}
          error={nameError}
          onChange={(event) => setContactName(event.target.value)}
        />
        <Field
          label="联系电话"
          value={contactPhone}
          error={phoneError}
          onChange={(event) => setContactPhone(event.target.value)}
        />
      </div>
    </Page>
  );
}
