import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ClientDetailView } from "./ClientDetailView";

const mockBack = vi.fn();
const mockNavigate = vi.fn();
let mockLocationState: Record<string, unknown> = {};

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useRouter: () => ({ navigate: mockNavigate, history: { back: mockBack } }),
    useRouterState: ({ select }: { select: (s: any) => any }) => {
      return select({ location: { state: mockLocationState } });
    },
  };
});

function renderWithQuery(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("ClientDetailView", () => {
  it("renders readonly mode with edit button", async () => {
    mockLocationState = {};
    renderWithQuery(<ClientDetailView clientId="c1" />);

    expect(await screen.findByText("客户 A")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "编辑" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "保存" })).not.toBeInTheDocument();
  });

  it("navigates with state on edit click", async () => {
    mockLocationState = {};
    mockNavigate.mockClear();
    const user = userEvent.setup();
    renderWithQuery(<ClientDetailView clientId="c1" />);

    await screen.findByText("客户 A");
    await user.click(screen.getByRole("button", { name: "编辑" }));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/client/$clientId",
      params: { clientId: "c1" },
      state: { mode: "editing" },
    });
  });

  it("renders edit form when location.state.mode is editing", async () => {
    mockLocationState = { mode: "editing" };
    renderWithQuery(<ClientDetailView clientId="c1" />);

    expect(await screen.findByDisplayValue("客户 A")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "取消" })).toBeInTheDocument();
  });

  it("navigates back on save", async () => {
    mockLocationState = { mode: "editing" };
    mockBack.mockClear();
    const user = userEvent.setup();
    renderWithQuery(<ClientDetailView clientId="c1" />);

    await screen.findByDisplayValue("客户 A");
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(mockBack).toHaveBeenCalled());
  });

  it("navigates back directly on cancel when clean", async () => {
    mockLocationState = { mode: "editing" };
    mockBack.mockClear();
    const user = userEvent.setup();
    renderWithQuery(<ClientDetailView clientId="c1" />);

    await screen.findByDisplayValue("客户 A");
    await user.click(screen.getByRole("button", { name: "取消" }));

    expect(mockBack).toHaveBeenCalled();
  });

  it("shows confirm dialog on cancel when dirty", async () => {
    mockLocationState = { mode: "editing" };
    mockBack.mockClear();
    const user = userEvent.setup();
    renderWithQuery(<ClientDetailView clientId="c1" />);

    await screen.findByDisplayValue("客户 A");
    const nameInput = screen.getByRole("textbox", { name: "名称" });
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");

    await user.click(screen.getByRole("button", { name: "取消" }));

    expect(screen.getByText("确认放弃更改？")).toBeInTheDocument();
    expect(mockBack).not.toHaveBeenCalled();
  });
});
