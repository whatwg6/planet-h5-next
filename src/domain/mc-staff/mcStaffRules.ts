import type { McStaff } from "./McStaff";

export function hasMcStaffIdentity(staff: McStaff) {
  return staff.id.trim().length > 0 && staff.email.trim().length > 0;
}

export function normalizeMcStaffKeyword(keyword: string) {
  return keyword.trim();
}

export function isSameMcStaff(left: Pick<McStaff, "email">, right: Pick<McStaff, "email">) {
  return left.email.trim().toLowerCase() === right.email.trim().toLowerCase();
}
