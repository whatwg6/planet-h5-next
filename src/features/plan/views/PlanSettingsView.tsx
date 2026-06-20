import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSavePlanSettingsMutation } from "@/features/plan/mutations/useSavePlanSettingsMutation";
import { usePlanDraftStore } from "@/features/plan/store/planDraftStore";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

const planSettingsSchema = z.object({
  name: z.string(),
  fields: z.record(z.string()),
});

type PlanSettingsValues = z.infer<typeof planSettingsSchema>;

export function PlanSettingsView({ clientId }: { clientId: string }) {
  const router = useRouter();
  const mutation = useSavePlanSettingsMutation();
  const saveMessage = usePlanDraftStore((state) => state.saveMessage);
  const { register, handleSubmit, formState } = useForm<PlanSettingsValues>({
    resolver: zodResolver(planSettingsSchema),
    defaultValues: { name: "", fields: {} },
  });

  return (
    <Page
      title="方案设置"
      onBack={() => router.history.back()}
      footer={<Button className="w-full" type="submit" form="plan-settings-form" disabled={mutation.isPending}>保存</Button>}
    >
      <form
        id="plan-settings-form"
        className="space-y-4"
        onSubmit={handleSubmit((values) => mutation.mutate({ clientId, name: values.name, fields: values.fields, rules: [] }))}
      >
        <Field label="名称" {...register("name")} error={formState.errors.name?.message} />
        {saveMessage ? <p className="text-sm text-functional-brand-foreground">{saveMessage}</p> : null}
      </form>
    </Page>
  );
}
