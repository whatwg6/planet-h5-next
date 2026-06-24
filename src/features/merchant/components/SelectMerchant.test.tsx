import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SelectMerchant } from "./SelectMerchant";

const useMerchantListQueryMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/merchant/queries/useMerchantListQuery", () => ({
  useMerchantListQuery: useMerchantListQueryMock,
}));

describe("SelectMerchant", () => {
  it("toggles selected merchant ids", async () => {
    const onChange = vi.fn();
    useMerchantListQueryMock.mockReturnValue({
      data: [{ id: "m1", name: "商户 A", city: "上海" }],
      isLoading: false,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
    });

    render(<SelectMerchant selectedIds={[]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /商户 A/ }));
    expect(onChange).toHaveBeenCalledWith(["m1"]);
  });
});
