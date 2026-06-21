import { useQuery } from "@tanstack/react-query";

import { searchMcStaffs } from "@/application/mc-staff/searchMcStaffs";
import { queryKeys } from "@/infrastructure/query/queryKeys";
import { mcStaffRepositoryMock } from "@/infrastructure/repositories/mc-staff/mcStaffRepository.mock";

export function useMcStaffSearchQuery(keyword: string) {
  return useQuery({
    queryKey: queryKeys.mcStaffs.search(keyword),
    queryFn: () => searchMcStaffs(mcStaffRepositoryMock, keyword),
  });
}
