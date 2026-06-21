import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientOrderRoute } from "./ClientOrderRoute";

const navigateMock = vi.fn();
const historyBackMock = vi.fn();
let routeState: Record<string, unknown> = {};
let routeParams: Record<string, string> = {
  clientId: "c1",
  planId: "p1",
  orderParams: "CO20260621001-t1781971200000",
};

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
  useParams: () => routeParams,
  useRouter: () => ({ history: { back: historyBackMock } }),
  useRouterState: <T,>({
    select,
  }: {
    select: (state: { location: { state: Record<string, unknown> } }) => T;
  }) => select({ location: { state: routeState } }),
}));

function renderWithQuery(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("ClientOrderRoute", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    historyBackMock.mockReset();
    routeState = {};
    routeParams = { clientId: "c1", planId: "p1", orderParams: "CO20260621001-t1781971200000" };
  });

  it("renders a controlled error state for invalid order params", () => {
    routeParams = { clientId: "c1", planId: "p1", orderParams: "bad" };

    renderWithQuery(<ClientOrderRoute />);

    expect(screen.getByText("订单参数缺少时间")).toBeInTheDocument();
  });

  it("renders order detail and enters list mode through route state", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ClientOrderRoute />);

    expect(await screen.findByText("商户已接单")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "查看总订单" }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/ops/client/$clientId/plan/$planId/order/$orderParams",
      params: { clientId: "c1", planId: "p1", orderParams: "CO20260621001-t1781971200000" },
      state: expect.any(Function),
    });

    expect(navigateMock.mock.calls[0][0].state({})).toMatchObject({ routeMode: "list" });
  });

  it("renders member orders from list route mode", async () => {
    routeState = { routeMode: "list" };

    renderWithQuery(<ClientOrderRoute />);

    expect(await screen.findByText("成员订单")).toBeInTheDocument();
    expect(await screen.findByText("王小星")).toBeInTheDocument();
  });
});
