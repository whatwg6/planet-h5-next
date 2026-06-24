import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PaymentMethodList } from "./PaymentMethodList";

const usePaymentMethodsQueryMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/payment/queries/usePaymentMethodsQuery", () => ({
  usePaymentMethodsQuery: usePaymentMethodsQueryMock,
}));

describe("PaymentMethodList", () => {
  it("toggles enabled payment method ids", async () => {
    const onChange = vi.fn();
    usePaymentMethodsQueryMock.mockReturnValue({
      data: [
        { id: "meican-card", name: "美餐卡", type: "meican", enabled: true },
        { id: "external-card", name: "外部支付", type: "external", enabled: false },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<PaymentMethodList clientId="client-meican" selectedIds={[]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /美餐卡/ }));
    expect(onChange).toHaveBeenCalledWith(["meican-card"]);
    expect(screen.getByRole("button", { name: /外部支付/ })).toBeDisabled();
  });
});
