import { useQuery } from "@tanstack/react-query";

import { searchMcStaffs } from "@/application/mc-staff/searchMcStaffs";
import { queryKeys } from "@/infrastructure/query/queryKeys";
import { mcStaffRepository } from "@/infrastructure/repositories/mc-staff";

export function useMcStaffSearchQuery(keyword: string) {
  return useQuery({
    queryKey: queryKeys.mcStaffs.search(keyword),
    queryFn: () => searchMcStaffs(mcStaffRepository, keyword),
  });
}
