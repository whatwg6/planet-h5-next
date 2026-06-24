import { describe, expect, it, vi } from "vitest";

import { listPaymentMethods } from "./listPaymentMethods";

describe("payment use cases", () => {
  it("delegates payment method listing to the repository", async () => {
    const repository = {
      listPaymentMethods: vi.fn().mockResolvedValue([{ id: "mc-card", name: "MC卡" }]),
    };

    await expect(listPaymentMethods(repository, "client-mc")).resolves.toEqual([
      { id: "mc-card", name: "MC卡" },
    ]);
    expect(repository.listPaymentMethods).toHaveBeenCalledWith("client-mc");
  });
});
