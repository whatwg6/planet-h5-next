import { describe, expect, it, vi } from "vitest";

import type { OrderRepository } from "@/domain/order/OrderRepository";

import { getClientOrderDetail } from "./getClientOrderDetail";
import { listClientMemberOrders } from "./listClientMemberOrders";

const query = {
  clientId: "c1",
  planId: "p1",
  params: { raw: "t1781884800000", time: 1781884800000 },
};

const repository: OrderRepository = {
  getClientOrderDetail: vi.fn().mockResolvedValue({ id: "o1" }),
  listClientMemberOrders: vi.fn().mockResolvedValue([{ id: "m1" }]),
};

describe("order use cases", () => {
  it("delegates order detail lookups to the repository", async () => {
    await getClientOrderDetail(repository, query);
    expect(repository.getClientOrderDetail).toHaveBeenCalledWith(query);
  });

  it("delegates member order list lookups to the repository", async () => {
    await listClientMemberOrders(repository, query);
    expect(repository.listClientMemberOrders).toHaveBeenCalledWith(query);
  });

  it("rejects empty route identifiers before repository access", async () => {
    await expect(getClientOrderDetail(repository, { ...query, clientId: " " })).rejects.toThrow(
      "clientId is required",
    );
    await expect(listClientMemberOrders(repository, { ...query, planId: " " })).rejects.toThrow(
      "planId is required",
    );
  });
});
