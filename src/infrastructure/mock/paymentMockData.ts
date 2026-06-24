import type { PaymentMethod } from "@/domain/payment/Payment";

export const paymentMockData: Record<string, PaymentMethod[]> = {
  "client-meican": [
    {
      id: "meican-card",
      name: "美餐卡",
      type: "meican",
      enabled: true,
      description: "企业默认支付方式",
    },
    {
      id: "external-card",
      name: "外部支付",
      type: "external",
      enabled: false,
      description: "需开通后使用",
    },
  ],
  c1: [
    {
      id: "meican-card",
      name: "美餐卡",
      type: "meican",
      enabled: true,
      description: "企业默认支付方式",
    },
    {
      id: "external-card",
      name: "外部支付",
      type: "external",
      enabled: false,
      description: "需开通后使用",
    },
  ],
};
