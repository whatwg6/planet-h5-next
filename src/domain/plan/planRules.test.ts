import { describe, expect, it } from "vitest";

import { hasPlanIdentity } from "./planRules";

describe("planRules boundary", () => {
  it("only checks whether a plan identity is present", () => {
    expect(hasPlanIdentity({ id: "p1" })).toBe(true);
    expect(hasPlanIdentity({ id: "" })).toBe(false);
  });
});
