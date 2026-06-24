import { useForm } from "react-hook-form";

import type { PlanDetail, PlanRule } from "@/domain/plan/Plan";
import { useSavePlanSettingsMutation } from "@/features/plan/mutations/useSavePlanSettingsMutation";
import { Toast } from "@/shared/ui/Feedback";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

const fieldKeyByMode: Record<string, string> = {
  menuStyle: "menuStyle",
  financeConfig: "financeConfig",
  maximumOrderAmount: "maximumOrderAmount",
  merchantOrderVerification: "merchantOrderVerification",
  hiddenAccountTypes: "hiddenAccountTypes",
  disableAppendDish: "disableAppendDish",
};

const ruleIdByMode: Record<string, PlanRule["id"]> = {
  operationDay: "operation-day",
  occupationTime: "occupation-time",
  restriction: "restriction",
  orderRule: "order-rule",
  orderTransfer: "order-transfer",
  manualConfirmOrder: "manual-confirm-order",
  pickupSetting: "pickup-setting",
  locationSetting: "location-setting",
};

const titleByMode: Record<string, string> = {
  menuStyle: "菜单样式",
  financeConfig: "财务配置",
  maximumOrderAmount: "最大下单金额",
  merchantOrderVerification: "商户接单校验",
  hiddenAccountTypes: "隐藏账号类型",
  disableAppendDish: "禁止加菜",
  operationDay: "营业日",
  occupationTime: "占用时间",
  restriction: "限购规则",
  orderRule: "下单规则",
  orderTransfer: "订单转移",
  manualConfirmOrder: "手动确认订单",
  pickupSetting: "取餐设置",
  locationSetting: "地址设置",
};

export function PlanSimpleSettingEditor({
  plan,
  settingId,
  onBack,
}: {
  plan: PlanDetail;
  settingId: string;
  onBack: () => void;
}) {
  const mutation = useSavePlanSettingsMutation();
  const fieldKey = fieldKeyByMode[settingId];
  const ruleId = ruleIdByMode[settingId];
  const rule = ruleId ? plan.rules.find((item) => item.id === ruleId) : undefined;
  const title = titleByMode[settingId] ?? "方案设置";
  const form = useForm<{ value: string }>({
    defaultValues: {
      value: fieldKey ? (plan.fields[fieldKey] ?? "") : (rule?.values.value ?? ""),
    },
  });

  return (
    <Page title={title} onBack={onBack}>
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit(({ value }) => {
          const nextFields = fieldKey ? { ...plan.fields, [fieldKey]: value } : plan.fields;
          const nextRules =
            ruleId && rule
              ? plan.rules.map((item) =>
                  item.id === ruleId ? { ...item, values: { value } } : item,
                )
              : ruleId
                ? [...plan.rules, { id: ruleId, label: title, values: { value } }]
                : plan.rules;

          mutation.mutate({
            clientId: plan.clientId,
            planId: plan.id,
            name: plan.name,
            fields: nextFields,
            rules: nextRules,
          });
        })}
      >
        <Field label={title} {...form.register("value", { required: true })} />
        <Button className="w-full" type="submit" disabled={mutation.isPending}>
          保存
        </Button>
        {mutation.isSuccess ? <Toast tone="success">已保存</Toast> : null}
        {mutation.isError ? <Toast tone="error">{mutation.error.message}</Toast> : null}
      </form>
    </Page>
  );
}
