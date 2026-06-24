import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PlanSettingsRoute } from "./PlanSettingsRoute";

const navigateMock = vi.fn();
const historyBackMock = vi.fn();
let routeState: Record<string, unknown> = {};
let paramsMock: Record<string, string> = { clientId: "c1", planId: "p1" };

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
  useParams: () => paramsMock,
  useRouter: () => ({ history: { back: historyBackMock } }),
  useRouterState: <T,>({
    select,
  }: {
    select: (state: { location: { pathname: string; state: Record<string, unknown> } }) => T;
  }) => select({ location: { pathname: "/ops/client/c1/plan/p1/setting", state: routeState } }),
}));

function renderWithQuery(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("PlanSettingsRoute", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    historyBackMock.mockReset();
    routeState = {};
    paramsMock = { clientId: "c1", planId: "p1" };
  });

  it("opens a plan setting mode on the same URL", async () => {
    renderWithQuery(<PlanSettingsRoute />);

    await userEvent.click(await screen.findByRole("button", { name: /基础信息/ }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/ops/client/$clientId/plan/$planId/setting",
      params: { clientId: "c1", planId: "p1" },
      state: expect.any(Function),
    });
    expect(navigateMock.mock.calls[0][0].state({})).toMatchObject({ routeMode: "baseInfo" });
  });

  it("renders a setting mode from route state", async () => {
    routeState = { routeMode: "baseInfo" };

    renderWithQuery(<PlanSettingsRoute />);

    expect(await screen.findByRole("heading", { name: "基础信息" })).toBeInTheDocument();
  });
});
