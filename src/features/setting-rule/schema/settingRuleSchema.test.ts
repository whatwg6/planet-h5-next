import { describe, expect, it } from "vitest";

import { settingRuleSchema } from "./settingRuleSchema";

describe("settingRuleSchema", () => {
  it("accepts rule fragments as data without deciding save ownership", () => {
    expect(
      settingRuleSchema.parse({
        rules: [{ id: "r1", label: "规则 A", values: { key: "value" } }],
      }),
    ).toEqual({
      rules: [{ id: "r1", label: "规则 A", values: { key: "value" } }],
    });
  });
});
