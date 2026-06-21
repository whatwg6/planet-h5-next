export type RouteMeta = {
  title: string;
  module: "client" | "plan" | "merchant" | "order";
  keepAlive?: boolean;
};

export const routeMeta = {
  "/client": { title: "客户列表", module: "client", keepAlive: true },
  "/client/$clientId": { title: "客户详情", module: "client" },
  "/ops/client": { title: "4.0 客户", module: "client", keepAlive: true },
  "/ops/client/$clientId": { title: "客户详情", module: "client" },
  "/client/$clientId/plans/settings": { title: "方案设置", module: "plan" },
  "/client/$clientId/plans/$planId": { title: "方案详情", module: "plan" },
  "/ops/client/$clientId/plan/$planId": { title: "方案详情", module: "plan" },
  "/ops/client/$clientId/plan/$planId/setting": { title: "方案设置", module: "plan" },
  "/ops/client/$clientId/plan/$planId/order/$orderParams": { title: "订单详情", module: "order" },
  "/merchant": { title: "商户列表", module: "merchant", keepAlive: true },
  "/merchant/$merchantId": { title: "商户详情", module: "merchant" },
} satisfies Record<string, RouteMeta>;
