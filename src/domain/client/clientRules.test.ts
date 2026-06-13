import { describe, expect, it } from "vitest";

import { hasClientIdentity } from "./clientRules";

describe("clientRules boundary", () => {
  it("only checks whether a client identity is present", () => {
    expect(hasClientIdentity({ id: "c1" })).toBe(true);
    expect(hasClientIdentity({ id: "" })).toBe(false);
  });
});
