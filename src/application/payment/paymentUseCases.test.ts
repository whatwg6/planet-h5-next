import { describe, expect, it, vi } from "vitest";

import { listPaymentMethods } from "./listPaymentMethods";

describe("payment use cases", () => {
  it("delegates payment method listing to the repository", async () => {
    const repository = {
      listPaymentMethods: vi.fn().mockResolvedValue([{ id: "meican-card", name: "美餐卡" }]),
    };

    await expect(listPaymentMethods(repository, "client-meican")).resolves.toEqual([
      { id: "meican-card", name: "美餐卡" },
    ]);
    expect(repository.listPaymentMethods).toHaveBeenCalledWith("client-meican");
  });
});
