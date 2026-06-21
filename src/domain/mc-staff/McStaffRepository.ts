import type { McStaff, McStaffSearchParams } from "./McStaff";

export type McStaffRepository = {
  searchMcStaffs(params: McStaffSearchParams): Promise<McStaff[]>;
};
