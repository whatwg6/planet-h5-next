export type PaymentMethod = {
  id: string;
  name: string;
  type: "mc" | "external";
  enabled: boolean;
  description?: string;
};
