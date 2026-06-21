import { describe, expect, it } from "vitest";

import { orderRepositoryMock } from "./orderRepository.mock";

describe("orderRepositoryMock", () => {
  it("finds order detail by order number", async () => {
    await expect(
      orderRepositoryMock.getClientOrderDetail({
        clientId: "c1",
        planId: "p1",
        params: {
          raw: "CO20260621001-t1781971200000",
          orderNo: "CO20260621001",
          time: 1781971200000,
        },
      }),
    ).resolves.toMatchObject({ id: "o1", productCount: 8 });
  });

  it("finds default order detail by date when order number is absent", async () => {
    await expect(
      orderRepositoryMock.getClientOrderDetail({
        clientId: "c1",
        planId: "p1",
        params: { raw: "t1782086400000", time: 1782086400000 },
      }),
    ).resolves.toMatchObject({ id: "o2", productCount: 4 });
  });

  it("returns deterministic member order rows for the matched order", async () => {
    const rows = await orderRepositoryMock.listClientMemberOrders({
      clientId: "c1",
      planId: "p1",
      params: {
        raw: "CO20260621001-t1781971200000",
        orderNo: "CO20260621001",
        time: 1781971200000,
      },
    });

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({ memberName: "王小星", productName: "照烧鸡腿饭" });
  });
});
