import { describe, expect, it } from "vitest";

import { mcStaffRepositoryMock } from "./mcStaffRepository.mock";

describe("mcStaffRepositoryMock", () => {
  it("filters staff by display name", async () => {
    const staff = await mcStaffRepositoryMock.searchMcStaffs({ keyword: "方案" });

    expect(staff).toEqual([expect.objectContaining({ id: "m4", displayName: "方案顾问" })]);
  });

  it("filters staff by email", async () => {
    const staff = await mcStaffRepositoryMock.searchMcStaffs({ keyword: "delivery" });

    expect(staff).toEqual([
      expect.objectContaining({ id: "m5", email: "delivery-manager@example.com" }),
    ]);
  });
});
