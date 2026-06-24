export type PaymentMethod = {
  id: string;
  name: string;
  type: "meican" | "external";
  enabled: boolean;
  description?: string;
};
