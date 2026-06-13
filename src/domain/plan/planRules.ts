export function hasPlanIdentity(plan: { id: string }) {
  return plan.id.trim().length > 0;
}
