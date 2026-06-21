import { beforeEach, describe, expect, it, vi } from "vitest";

import type { McStaffRepository } from "@/domain/mc-staff/McStaffRepository";

import { searchMcStaffs } from "./searchMcStaffs";

const repository: McStaffRepository = {
  searchMcStaffs: vi
    .fn()
    .mockResolvedValue([{ id: "s1", displayName: "负责人 A", email: "owner-a@example.com" }]),
};

describe("mc staff use cases", () => {
  beforeEach(() => {
    vi.mocked(repository.searchMcStaffs).mockClear();
  });

  it("returns empty results for blank search without hitting the repository", async () => {
    await expect(searchMcStaffs(repository, " ")).resolves.toEqual([]);
    expect(repository.searchMcStaffs).not.toHaveBeenCalled();
  });

  it("normalizes search keyword before delegation", async () => {
    await searchMcStaffs(repository, "  负责人  ");
    expect(repository.searchMcStaffs).toHaveBeenCalledWith({ keyword: "负责人" });
  });
});
