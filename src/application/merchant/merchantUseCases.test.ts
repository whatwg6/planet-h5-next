import { describe, expect, it, vi } from "vitest";

import type { MerchantRepository } from "@/domain/merchant/MerchantRepository";

import { getMerchantDetail } from "./getMerchantDetail";
import { getMerchantList } from "./getMerchantList";

const repository: MerchantRepository = {
  listMerchants: vi.fn().mockResolvedValue([{ id: "m1", name: "商户 A" }]),
  getMerchantDetail: vi.fn().mockResolvedValue({ id: "m1", name: "商户 A", fields: {} }),
};

describe("merchant use cases", () => {
  it("delegates list params to the repository", async () => {
    await getMerchantList(repository, { keyword: "A" });
    expect(repository.listMerchants).toHaveBeenCalledWith({ keyword: "A" });
  });

  it("rejects empty merchant ids before detail lookup", async () => {
    await expect(getMerchantDetail(repository, "")).rejects.toThrow("merchantId is required");
  });
});
