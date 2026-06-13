import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { SettingRuleFormValues } from "../types";
import { settingRuleSchema } from "../schema/settingRuleSchema";

export function useSettingRuleForm(defaultValues: SettingRuleFormValues) {
  return useForm<SettingRuleFormValues>({
    resolver: zodResolver(settingRuleSchema),
    defaultValues,
  });
}
