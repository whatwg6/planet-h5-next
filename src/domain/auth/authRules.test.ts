import { describe, expect, it } from "vitest";

import type { CurrentUserSession } from "./Auth";
import { hasPermission } from "./authRules";

describe("authRules", () => {
  const session: CurrentUserSession = {
    userId: "u1",
    name: "运营用户",
    permissions: ["client:list:view"],
  };

  it("allows existing permission codes", () => {
    expect(hasPermission(session, "client:list:view")).toBe(true);
  });

  it("rejects missing permission codes and anonymous sessions", () => {
    expect(hasPermission(session, "order:view")).toBe(false);
    expect(hasPermission(null, "client:list:view")).toBe(false);
  });
});
