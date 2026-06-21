import type { McStaffRepository } from "@/domain/mc-staff/McStaffRepository";
import { mcStaffMockData } from "@/infrastructure/mock/mcStaffMockData";

export const mcStaffRepositoryMock: McStaffRepository = {
  async searchMcStaffs(params) {
    const keyword = params.keyword.trim().toLowerCase();
    if (!keyword) return [];

    return mcStaffMockData.filter(
      (staff) =>
        staff.displayName.toLowerCase().includes(keyword) ||
        staff.email.toLowerCase().includes(keyword) ||
        staff.department?.toLowerCase().includes(keyword),
    );
  },
};
