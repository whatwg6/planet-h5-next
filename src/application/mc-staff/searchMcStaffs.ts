import type { McStaffRepository } from "@/domain/mc-staff/McStaffRepository";
import { normalizeMcStaffKeyword } from "@/domain/mc-staff/mcStaffRules";

export function searchMcStaffs(repository: McStaffRepository, keyword: string) {
  const normalizedKeyword = normalizeMcStaffKeyword(keyword);
  if (!normalizedKeyword) return Promise.resolve([]);
  return repository.searchMcStaffs({ keyword: normalizedKeyword });
}
