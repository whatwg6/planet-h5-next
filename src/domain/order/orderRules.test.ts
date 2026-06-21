import { describe, expect, it } from "vitest";

import {
  buildPriceSummaryRows,
  formatMerchantOrderStatus,
  formatOrderMoney,
  getDisplayScheduleNodes,
  parseOrderParams,
} from "./orderRules";

describe("orderRules", () => {
  it("parses legacy order params with only time", () => {
    expect(parseOrderParams("t1781884800000")).toEqual({
      ok: true,
      value: { raw: "t1781884800000", time: 1781884800000 },
    });
  });

  it("parses legacy order params with order number and time", () => {
    expect(parseOrderParams("CO20260621001-t1781884800000")).toEqual({
      ok: true,
      value: { raw: "CO20260621001-t1781884800000", orderNo: "CO20260621001", time: 1781884800000 },
    });
  });

  it("rejects malformed order params", () => {
    expect(parseOrderParams("CO20260621001")).toEqual({ ok: false, error: "订单参数缺少时间" });
    expect(parseOrderParams("tbad")).toEqual({ ok: false, error: "订单时间无效" });
  });

  it("centralizes order display rules", () => {
    expect(formatOrderMoney(12345)).toBe("¥123.45");
    expect(formatMerchantOrderStatus("notAccepted")).toBe("商户未接单");
    expect(
      buildPriceSummaryRows({ totalAmountCents: 3500, refundAmountCents: 500 })[0],
    ).toMatchObject({
      label: "原始订单总额",
      value: "¥35.00",
    });
  });

  it("uses default schedule before an order number exists", () => {
    const scheduleNodes = [{ id: "actual", orderDeadline: "", mealTime: "", merchants: [] }];
    const defaultScheduleNodes = [
      { id: "default", orderDeadline: "", mealTime: "", merchants: [] },
    ];

    expect(
      getDisplayScheduleNodes({ hasOrderNo: false, scheduleNodes, defaultScheduleNodes }),
    ).toEqual(defaultScheduleNodes);
    expect(
      getDisplayScheduleNodes({ hasOrderNo: true, scheduleNodes, defaultScheduleNodes }),
    ).toEqual(scheduleNodes);
  });
});
