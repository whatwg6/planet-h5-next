import { useForm } from "react-hook-form";

import type { PlanDetail } from "@/domain/plan/Plan";
import { useSavePlanSettingsMutation } from "@/features/plan/mutations/useSavePlanSettingsMutation";
import { Toast } from "@/shared/ui/Feedback";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

type PlanBaseInfoValues = {
  name: string;
  owner: string;
  businessType: string;
  menuStyle: string;
};

export function PlanBaseInfoEditor({ plan, onBack }: { plan: PlanDetail; onBack: () => void }) {
  const mutation = useSavePlanSettingsMutation();
  const form = useForm<PlanBaseInfoValues>({
    defaultValues: {
      name: plan.name,
      owner: plan.fields.owner ?? "",
      businessType: plan.fields.businessType ?? "",
      menuStyle: plan.fields.menuStyle ?? "",
    },
  });

  return (
    <Page title="基础信息" onBack={onBack}>
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit((values) =>
          mutation.mutate({
            clientId: plan.clientId,
            planId: plan.id,
            name: values.name,
            fields: {
              ...plan.fields,
              owner: values.owner,
              businessType: values.businessType,
              menuStyle: values.menuStyle,
            },
            rules: plan.rules,
          }),
        )}
      >
        <Field label="方案名称" {...form.register("name", { required: true })} />
        <Field label="负责人" {...form.register("owner", { required: true })} />
        <Field label="业务类型" {...form.register("businessType", { required: true })} />
        <Field label="菜单样式" {...form.register("menuStyle", { required: true })} />
        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          保存
        </Button>
        {mutation.isSuccess ? <Toast tone="success">已保存</Toast> : null}
        {mutation.isError ? <Toast tone="error">{mutation.error.message}</Toast> : null}
      </form>
    </Page>
  );
}
