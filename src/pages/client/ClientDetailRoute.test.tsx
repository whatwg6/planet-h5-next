import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientDetailRoute } from "./ClientDetailRoute";

const navigateMock = vi.fn();
const historyBackMock = vi.fn();
let routeState: Record<string, unknown> = {};

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ clientId: "c1" }),
  useRouter: () => ({ history: { back: historyBackMock } }),
  useRouterState: <T,>({
    select,
  }: {
    select: (state: { location: { pathname: string; state: Record<string, unknown> } }) => T;
  }) => select({ location: { pathname: "/ops/client-next/c1", state: routeState } }),
}));

function renderWithQuery(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("ClientDetailRoute", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    historyBackMock.mockReset();
    routeState = {};
  });

  it("pushes settings mode into route state from the detail home page", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ClientDetailRoute />);

    expect(await screen.findByText("客户 A")).toBeInTheDocument();
    expect(screen.getByText("测试客户")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /客户设置/ }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/ops/client-next/$clientId",
      params: { clientId: "c1" },
      state: expect.any(Function),
    });

    const settingsState = navigateMock.mock.calls[0][0].state({ __TSR_index: 0 });
    expect(settingsState).toMatchObject({ routeMode: "setting" });
    expect(screen.queryByRole("button", { name: "保存" })).not.toBeInTheDocument();
  });

  it("pushes edit mode from the settings page name and remark row", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "setting" };

    renderWithQuery(<ClientDetailRoute />);

    await user.click(await screen.findByRole("button", { name: /名称与备注/ }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/ops/client-next/$clientId",
      params: { clientId: "c1" },
      state: expect.any(Function),
    });

    const editState = navigateMock.mock.calls[0][0].state({ __TSR_index: 0 });
    expect(editState).toMatchObject({ routeMode: "edit" });
  });

  it("opens plan details from the meal plans mode", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "plan" };

    renderWithQuery(<ClientDetailRoute />);

    await user.click(await screen.findByRole("button", { name: /方案 A/ }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/ops/client-next/$clientId/plan/$planId",
      params: { clientId: "c1", planId: "p1" },
    });
  });

  it("renders edit mode from route state and pops the pushed route on clean cancel", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "edit" };

    renderWithQuery(<ClientDetailRoute />);

    expect(await screen.findByRole("button", { name: "保存" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(historyBackMock).toHaveBeenCalledTimes(1));
  });

  it("uses the discard confirmation when the navigation bar back button leaves dirty edit mode", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "edit" };

    renderWithQuery(<ClientDetailRoute />);

    const nameField = await screen.findByLabelText("名称");
    await user.clear(nameField);
    await user.type(nameField, "客户 A+");
    await user.click(screen.getByRole("button", { name: "返回" }));

    expect(screen.getByText("确认放弃更改？")).toBeInTheDocument();
    expect(historyBackMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "确认" }));
    await waitFor(() => expect(historyBackMock).toHaveBeenCalledTimes(1));
  });
});
