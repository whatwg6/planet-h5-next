import { describe, expect, it, vi } from "vitest";

import type { ClientRepository } from "@/domain/client/ClientRepository";

import { getClientDetail } from "./getClientDetail";
import { getClientList } from "./getClientList";
import { updateClient } from "./updateClient";

const repository: ClientRepository = {
  listClients: vi.fn().mockResolvedValue([{ id: "c1", name: "客户 A" }]),
  getClientDetail: vi.fn().mockResolvedValue({ id: "c1", name: "客户 A", fields: {}, planIds: [] }),
  updateClient: vi.fn().mockResolvedValue({ id: "c1", name: "客户 A", fields: {}, planIds: [] }),
};

describe("client use cases", () => {
  it("delegates list params to the repository", async () => {
    await getClientList(repository, { keyword: "A" });
    expect(repository.listClients).toHaveBeenCalledWith({ keyword: "A" });
  });

  it("rejects empty client ids before detail lookup", async () => {
    await expect(getClientDetail(repository, " ")).rejects.toThrow("clientId is required");
  });

  it("passes update values through without applying business decisions", async () => {
    await updateClient(repository, { clientId: "c1", values: { name: "客户 A" } });
    expect(repository.updateClient).toHaveBeenCalledWith({ clientId: "c1", values: { name: "客户 A" } });
  });
});
