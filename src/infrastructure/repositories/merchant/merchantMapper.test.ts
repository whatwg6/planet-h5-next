import { describe, expect, it } from "vitest";

import { mapMerchantDetailDto, mapMerchantSummaryDto } from "./merchantMapper";

describe("merchantMapper", () => {
  it("maps summary and detail DTOs without filtering by business state", () => {
    expect(mapMerchantSummaryDto({ id: "m1", name: "商户 A", city: "上海" })).toEqual({
      id: "m1",
      name: "商户 A",
      city: "上海",
    });
    expect(mapMerchantDetailDto({ id: "m1", name: "商户 A", city: "上海", fields: { contact: "李四" } })).toEqual({
      id: "m1",
      name: "商户 A",
      city: "上海",
      fields: { contact: "李四" },
    });
  });
});
