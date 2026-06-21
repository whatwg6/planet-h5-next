export type OrderStatus =
  | "submitted"
  | "accepted"
  | "making"
  | "delivering"
  | "arrived"
  | "refunded";

export type MerchantOrderStatus = "notAccepted" | "accepted" | "making" | "delivering" | "arrived";

export type ParsedOrderParams = {
  raw: string;
  time: number;
  orderNo?: string;
};

export type OrderParamsParseResult =
  | { ok: true; value: ParsedOrderParams }
  | { ok: false; error: string };

export type OrderScheduleNode = {
  id: string;
  orderDeadline: string;
  mealTime: string;
  merchants: { id: string; name: string }[];
};

export type OrderPriceSummary = {
  totalAmountCents: number;
  refundAmountCents: number;
  mealPointCount?: number;
  refundMealPointCount?: number;
};

export type ClientMemberOrderItem = {
  id: string;
  memberId: string;
  memberName: string;
  contact: string;
  productName: string;
  merchantName: string;
  count: number;
  refundCount: number;
  amountCents: number;
  status: OrderStatus;
};

export type MerchantOrderSummary = {
  merchantId: string;
  merchantName: string;
  status: MerchantOrderStatus;
  productCount: number;
  amountCents: number;
};

export type ClientOrderDetail = {
  id: string;
  clientId: string;
  planId: string;
  orderNo?: string;
  orderDate: string;
  status: OrderStatus;
  scheduleNodes: OrderScheduleNode[];
  defaultScheduleNodes: OrderScheduleNode[];
  priceSummary: OrderPriceSummary;
  productCount: number;
  memberCount: number;
  merchantSummaries: MerchantOrderSummary[];
};

export type ClientOrderQuery = {
  clientId: string;
  planId: string;
  params: ParsedOrderParams;
};
