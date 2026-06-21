export type McStaff = {
  id: string;
  displayName: string;
  email: string;
  department?: string;
};

export type McStaffSearchParams = {
  keyword: string;
};
