import { z } from "zod";

export const settingRuleSchema = z.object({
  rules: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      values: z.record(z.string()),
    }),
  ),
});
