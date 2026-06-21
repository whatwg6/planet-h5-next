import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { PlanRule, PlanSettingSummary } from "@/domain/plan/Plan";
import { useSavePlanSettingsMutation } from "@/features/plan/mutations/useSavePlanSettingsMutation";
import { usePlanDetailQuery } from "@/features/plan/queries/usePlanDetailQuery";
import { SettingRuleEditor } from "@/features/setting-rule/components/SettingRuleEditor";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui/Feedback";
import { Button, Field } from "@/shared/ui/Form";
import { Page } from "@/shared/ui/Page";

const settingGroupTitle: Record<PlanSettingSummary["group"], string> = {
  basic: "基础设置",
  order: "下单设置",
  menu: "菜单设置",
  restriction: "限制设置",
  pickup: "取餐设置",
  finance: "财务设置",
  advanced: "高级设置",
};

const settingGroups: PlanSettingSummary["group"][] = [
  "basic",
  "menu",
  "order",
  "restriction",
  "pickup",
  "finance",
  "advanced",
];

const planSettingsSchema = z.object({
  name: z.string().min(1, "请输入方案名称"),
  fields: z.object({
    owner: z.string().min(1, "请输入负责人"),
    businessType: z.string().min(1, "请输入业务类型"),
    menuStyle: z.string().min(1, "请输入菜单样式"),
    hidePrice: z.string().min(1, "请输入隐藏价格配置"),
    hidePriceMealPoint: z.string().min(1, "请输入隐藏价格和餐点配置"),
    dishRemark: z.string().min(1, "请输入菜品备注配置"),
    deliveryRemark: z.string().min(1, "请输入配送备注配置"),
    pickupCode: z.string().min(1, "请输入取餐码配置"),
    financeConfig: z.string().min(1, "请输入财务配置"),
    maximumOrderAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "请输入合法金额"),
    merchantOrderVerification: z.string().min(1, "请输入商户接单校验配置"),
    hiddenAccountTypes: z.string().min(1, "请输入隐藏账号类型配置"),
    disableAppendDish: z.string().min(1, "请输入禁止加菜配置"),
  }),
});

type PlanSettingsValues = z.infer<typeof planSettingsSchema>;

function createDefaultValues(fields: Record<string, string> = {}, name = ""): PlanSettingsValues {
  return {
    name,
    fields: {
      owner: fields.owner ?? "",
      businessType: fields.businessType ?? "",
      menuStyle: fields.menuStyle ?? "",
      hidePrice: fields.hidePrice ?? "",
      hidePriceMealPoint: fields.hidePriceMealPoint ?? "",
      dishRemark: fields.dishRemark ?? "",
      deliveryRemark: fields.deliveryRemark ?? "",
      pickupCode: fields.pickupCode ?? "",
      financeConfig: fields.financeConfig ?? "",
      maximumOrderAmount: fields.maximumOrderAmount ?? "",
      merchantOrderVerification: fields.merchantOrderVerification ?? "",
      hiddenAccountTypes: fields.hiddenAccountTypes ?? "",
      disableAppendDish: fields.disableAppendDish ?? "",
    },
  };
}

export function PlanSettingsView({ clientId, planId }: { clientId: string; planId: string }) {
  const router = useRouter();
  const query = usePlanDetailQuery(clientId, planId);
  const mutation = useSavePlanSettingsMutation();
  const [rules, setRules] = useState<PlanRule[]>([]);
  const form = useForm<PlanSettingsValues>({
    resolver: zodResolver(planSettingsSchema),
    defaultValues: createDefaultValues(),
  });
  const back = () => router.history.back();

  useEffect(() => {
    if (!query.data) return;
    form.reset(createDefaultValues(query.data.fields, query.data.name));
    setRules(query.data.rules);
  }, [form, query.data]);

  if (query.isLoading)
    return (
      <Page title="方案设置" onBack={back}>
        <LoadingState />
      </Page>
    );

  if (query.isError || !query.data)
    return (
      <Page title="方案设置" onBack={back}>
        <ErrorState title="加载失败" onRetry={() => query.refetch()} />
      </Page>
    );

  return (
    <Page
      title="方案设置"
      onBack={back}
      footer={
        <Button
          className="w-full"
          type="submit"
          form="plan-settings-form"
          disabled={mutation.isPending}
        >
          保存
        </Button>
      }
    >
      {query.data.settings.length === 0 ? (
        <EmptyState title="暂无方案设置" />
      ) : (
        <div className="space-y-4">
          <form
            id="plan-settings-form"
            className="space-y-4"
            onSubmit={form.handleSubmit((values) =>
              mutation.mutate({
                clientId,
                planId,
                name: values.name,
                fields: values.fields,
                rules,
              }),
            )}
          >
            <section className="space-y-3 rounded-md border border-border-solid-line-2 bg-background-primary-container p-3 shadow-card">
              <h2 className="text-sm font-medium text-text-primary">基础设置</h2>
              <Field
                label="方案名称"
                {...form.register("name")}
                error={form.formState.errors.name?.message}
              />
              <Field
                label="负责人"
                {...form.register("fields.owner")}
                error={form.formState.errors.fields?.owner?.message}
              />
              <Field
                label="业务类型"
                {...form.register("fields.businessType")}
                error={form.formState.errors.fields?.businessType?.message}
              />
              <Field
                label="菜单样式"
                {...form.register("fields.menuStyle")}
                error={form.formState.errors.fields?.menuStyle?.message}
              />
              <Field
                label="隐藏价格"
                {...form.register("fields.hidePrice")}
                error={form.formState.errors.fields?.hidePrice?.message}
              />
              <Field
                label="隐藏价格和餐点"
                {...form.register("fields.hidePriceMealPoint")}
                error={form.formState.errors.fields?.hidePriceMealPoint?.message}
              />
              <Field
                label="菜品备注"
                {...form.register("fields.dishRemark")}
                error={form.formState.errors.fields?.dishRemark?.message}
              />
              <Field
                label="配送备注"
                {...form.register("fields.deliveryRemark")}
                error={form.formState.errors.fields?.deliveryRemark?.message}
              />
              <Field
                label="取餐码"
                {...form.register("fields.pickupCode")}
                error={form.formState.errors.fields?.pickupCode?.message}
              />
              <Field
                label="财务配置"
                {...form.register("fields.financeConfig")}
                error={form.formState.errors.fields?.financeConfig?.message}
              />
              <Field
                label="最大下单金额"
                inputMode="decimal"
                {...form.register("fields.maximumOrderAmount")}
                error={form.formState.errors.fields?.maximumOrderAmount?.message}
              />
              <Field
                label="商户接单校验"
                {...form.register("fields.merchantOrderVerification")}
                error={form.formState.errors.fields?.merchantOrderVerification?.message}
              />
              <Field
                label="隐藏账号类型"
                {...form.register("fields.hiddenAccountTypes")}
                error={form.formState.errors.fields?.hiddenAccountTypes?.message}
              />
              <Field
                label="禁止加菜"
                {...form.register("fields.disableAppendDish")}
                error={form.formState.errors.fields?.disableAppendDish?.message}
              />
              {mutation.isError ? (
                <p className="text-sm text-functional-error-foreground">{mutation.error.message}</p>
              ) : null}
              {mutation.isSuccess ? (
                <p className="text-sm text-functional-brand-foreground">已保存</p>
              ) : null}
            </section>

            <section className="space-y-3 rounded-md border border-border-solid-line-2 bg-background-primary-container p-3 shadow-card">
              <h2 className="text-sm font-medium text-text-primary">规则设置</h2>
              <SettingRuleEditor rules={rules} onChange={setRules} />
            </section>
          </form>

          {settingGroups.map((group) => {
            const settings = query.data.settings.filter((setting) => setting.group === group);
            if (settings.length === 0) return null;

            return (
              <section key={group} className="space-y-2">
                <h2 className="px-1 text-xs font-medium text-text-tertiary">
                  {settingGroupTitle[group]}
                </h2>
                <div className="overflow-hidden rounded-md border border-border-solid-line-2 bg-background-primary-container shadow-card">
                  {settings.map((setting) => (
                    <SettingRow key={setting.id} setting={setting} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </Page>
  );
}

function SettingRow({ setting }: { setting: PlanSettingSummary }) {
  return (
    <button
      type="button"
      disabled={setting.disabled || setting.editable === "placeholder"}
      className="flex w-full items-center justify-between gap-3 border-b border-border-solid-line-2 px-3 py-4 text-left last:border-b-0 disabled:opacity-100"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-text-primary">{setting.title}</span>
        {setting.description ? (
          <span className="mt-1 block text-xs text-text-secondary">{setting.description}</span>
        ) : null}
      </span>
      <span className="shrink-0 text-sm text-text-secondary">
        {setting.disabled || setting.editable === "placeholder"
          ? "待迁移"
          : (setting.value ?? "未设置")}
      </span>
    </button>
  );
}
