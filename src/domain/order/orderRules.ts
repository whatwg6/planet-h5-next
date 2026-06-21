import type {
  MerchantOrderStatus,
  OrderParamsParseResult,
  OrderPriceSummary,
  OrderScheduleNode,
  OrderStatus,
} from "./Order";

const orderStatusText: Record<OrderStatus, string> = {
  submitted: "已下单",
  accepted: "商户已接单",
  making: "制作中",
  delivering: "配送中",
  arrived: "已送达",
  refunded: "已退款",
};

const merchantOrderStatusText: Record<MerchantOrderStatus, string> = {
  notAccepted: "商户未接单",
  accepted: "商户已接单",
  making: "制作中",
  delivering: "配送中",
  arrived: "已送达",
};

export function parseOrderParams(orderParams?: string): OrderParamsParseResult {
  if (!orderParams?.trim()) return { ok: false, error: "订单参数不能为空" };

  const parts = orderParams.split("-");
  const timePart = parts.length === 1 ? parts[0] : parts.at(-1);

  if (!timePart?.startsWith("t")) return { ok: false, error: "订单参数缺少时间" };

  const time = Number(timePart.slice(1));
  if (!Number.isFinite(time) || time <= 0) return { ok: false, error: "订单时间无效" };

  const orderNo = parts.length > 1 ? parts.slice(0, -1).join("-").trim() : "";
  return {
    ok: true,
    value: {
      raw: orderParams,
      time,
      ...(orderNo ? { orderNo } : {}),
    },
  };
}

export function formatOrderStatus(status: OrderStatus) {
  return orderStatusText[status];
}

export function formatMerchantOrderStatus(status: MerchantOrderStatus) {
  return merchantOrderStatusText[status];
}

export function formatOrderMoney(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}

export function formatOrderDateTime(value: string | number | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (input: number) => input.toString().padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function getDisplayScheduleNodes({
  hasOrderNo,
  scheduleNodes,
  defaultScheduleNodes,
}: {
  hasOrderNo: boolean;
  scheduleNodes: OrderScheduleNode[];
  defaultScheduleNodes: OrderScheduleNode[];
}) {
  return hasOrderNo ? scheduleNodes : defaultScheduleNodes;
}

export function buildPriceSummaryRows(summary: OrderPriceSummary) {
  return [
    {
      label: "原始订单总额",
      value: formatOrderMoney(summary.totalAmountCents),
      mealPointCount: summary.mealPointCount,
      variant: "primary" as const,
    },
    {
      label: "退款总额",
      value: formatOrderMoney(summary.refundAmountCents),
      mealPointCount: summary.refundMealPointCount,
      variant: "secondary" as const,
    },
  ];
}
