import type { McStaff } from "@/domain/mc-staff/McStaff";

export const mcStaffMockData: McStaff[] = [
  { id: "m1", displayName: "负责人 A", email: "owner-a@example.com", department: "客户成功" },
  { id: "m2", displayName: "运营 A", email: "ops-a@example.com", department: "运营支持" },
  { id: "m3", displayName: "负责人 B", email: "owner-b@example.com", department: "客户成功" },
  {
    id: "m4",
    displayName: "方案顾问",
    email: "plan-consultant@example.com",
    department: "方案运营",
  },
  {
    id: "m5",
    displayName: "交付经理",
    email: "delivery-manager@example.com",
    department: "交付中心",
  },
];
