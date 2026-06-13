export function hasMerchantIdentity(merchant: { id: string }) {
  return merchant.id.trim().length > 0;
}
