import { describe, expect, it } from "vitest";

import { hasMerchantIdentity } from "./merchantRules";

describe("merchantRules boundary", () => {
  it("only checks whether a merchant identity is present", () => {
    expect(hasMerchantIdentity({ id: "m1" })).toBe(true);
    expect(hasMerchantIdentity({ id: " " })).toBe(false);
  });
});
