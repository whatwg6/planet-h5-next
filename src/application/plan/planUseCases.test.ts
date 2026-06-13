import { describe, expect, it, vi } from "vitest";

import type { PlanRepository } from "@/domain/plan/PlanRepository";

import { getPlanDetail } from "./getPlanDetail";
import { savePlanSettings } from "./savePlanSettings";

const repository: PlanRepository = {
  getPlanDetail: vi.fn().mockResolvedValue({ id: "p1", clientId: "c1", name: "方案 A", fields: {}, rules: [] }),
  savePlanSettings: vi.fn().mockResolvedValue({ id: "p1", clientId: "c1", name: "方案 A", fields: {}, rules: [] }),
};

describe("plan use cases", () => {
  it("rejects missing ids before plan detail lookup", async () => {
    await expect(getPlanDetail(repository, "", "p1")).rejects.toThrow("clientId is required");
    await expect(getPlanDetail(repository, "c1", "")).rejects.toThrow("planId is required");
  });

  it("passes plan settings through to the repository", async () => {
    await savePlanSettings(repository, { clientId: "c1", planId: "p1", name: "方案 A", fields: {}, rules: [] });
    expect(repository.savePlanSettings).toHaveBeenCalledWith({
      clientId: "c1",
      planId: "p1",
      name: "方案 A",
      fields: {},
      rules: [],
    });
  });
});
