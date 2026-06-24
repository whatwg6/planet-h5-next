import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SelectMcStaff } from "./SelectMcStaff";

const useMcStaffSearchQueryMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/mc-staff/queries/useMcStaffSearchQuery", () => ({
  useMcStaffSearchQuery: useMcStaffSearchQueryMock,
}));

describe("SelectMcStaff", () => {
  it("toggles selected staff ids", async () => {
    const onChange = vi.fn();
    useMcStaffSearchQueryMock.mockReturnValue({
      data: [{ id: "m1", displayName: "负责人 A", email: "owner-a@example.com" }],
      isLoading: false,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
    });

    render(<SelectMcStaff selectedIds={[]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /负责人 A/ }));
    expect(onChange).toHaveBeenCalledWith(["m1"]);
  });
});
