export type RouteMeta = {
  title: string;
  module: "client" | "plan" | "merchant";
  keepAlive?: boolean;
};

export const routeMeta = {
  "/client": { title: "客户列表", module: "client", keepAlive: true },
  "/client/$clientId": { title: "客户详情", module: "client" },
  "/ops/client-next": { title: "4.0 客户", module: "client", keepAlive: true },
  "/ops/client-next/$clientId": { title: "客户详情", module: "client" },
  "/client/$clientId/plans/settings": { title: "方案设置", module: "plan" },
  "/client/$clientId/plans/$planId": { title: "方案详情", module: "plan" },
  "/ops/client-next/$clientId/plan/$planId": { title: "方案详情", module: "plan" },
  "/merchant": { title: "商户列表", module: "merchant", keepAlive: true },
  "/merchant/$merchantId": { title: "商户详情", module: "merchant" },
} satisfies Record<string, RouteMeta>;
