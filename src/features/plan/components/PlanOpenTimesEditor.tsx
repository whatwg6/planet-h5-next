import { useForm } from "react-hook-form";

import type { PlanDetail } from "@/domain/plan/Plan";
import { useSavePlanSettingsMutation } from "@/features/plan/mutations/useSavePlanSettingsMutation";
import { Toast } from "@/shared/ui/Feedback";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

type OpenTimesValues = {
  breakfast: string;
  lunch: string;
  dinner: string;
};

export function PlanOpenTimesEditor({ plan, onBack }: { plan: PlanDetail; onBack: () => void }) {
  const mutation = useSavePlanSettingsMutation();
  const openTimes = plan.rules.find((rule) => rule.id === "open-times");
  const form = useForm<OpenTimesValues>({
    defaultValues: {
      breakfast: openTimes?.values.breakfast ?? "",
      lunch: openTimes?.values.lunch ?? openTimes?.values.value ?? "",
      dinner: openTimes?.values.dinner ?? "",
    },
  });

  return (
    <Page title="开放时间" onBack={onBack}>
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit((values) => {
          const nextRule = {
            id: "open-times" as const,
            label: openTimes?.label ?? "开放时间",
            values: Object.fromEntries(
              Object.entries(values).filter(([, value]) => value.trim().length > 0),
            ),
          };
          mutation.mutate({
            clientId: plan.clientId,
            planId: plan.id,
            name: plan.name,
            fields: plan.fields,
            rules: plan.rules.some((rule) => rule.id === "open-times")
              ? plan.rules.map((rule) => (rule.id === "open-times" ? nextRule : rule))
              : [...plan.rules, nextRule],
          });
        })}
      >
        <Field label="早餐" placeholder="08:00-10:00" {...form.register("breakfast")} />
        <Field label="午餐" placeholder="11:00-13:00" {...form.register("lunch")} />
        <Field label="晚餐" placeholder="17:00-19:00" {...form.register("dinner")} />
        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          保存
        </Button>
        {mutation.isSuccess ? <Toast tone="success">已保存</Toast> : null}
        {mutation.isError ? <Toast tone="error">{mutation.error.message}</Toast> : null}
      </form>
    </Page>
  );
}
