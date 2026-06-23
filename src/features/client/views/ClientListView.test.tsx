import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ClientSummary } from "@/domain/client/Client";
import { useClientListStore } from "@/features/client/store/clientListStore";

import { ClientListView } from "./ClientListView";

const useClientListQueryMock = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, params }: { children: ReactNode; params: { clientId: string } }) => (
    <a href={`/ops/client/${params.clientId}`}>{children}</a>
  ),
}));

vi.mock("@/features/client/queries/useClientListQuery", () => ({
  useClientListQuery: useClientListQueryMock,
}));

function mockClientListQuery(state: {
  data?: ClientSummary[];
  isLoading?: boolean;
  isError?: boolean;
}) {
  useClientListQueryMock.mockReturnValue({
    data: state.data,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
    refetch: vi.fn(),
  });
}

describe("ClientListView", () => {
  beforeEach(() => {
    useClientListQueryMock.mockReset();
    useClientListStore.setState({ draftKeyword: "", committedKeyword: "" });
  });

  it("renders the loading state", () => {
    mockClientListQuery({ isLoading: true });

    render(<ClientListView />);

    expect(screen.getByText("加载中")).toBeInTheDocument();
  });

  it("renders the empty state", () => {
    mockClientListQuery({ data: [] });

    render(<ClientListView />);

    expect(screen.getByText("暂无数据")).toBeInTheDocument();
  });

  it("renders the error state", () => {
    mockClientListQuery({ isError: true });

    render(<ClientListView />);

    expect(screen.getByText("加载失败")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重试" })).toBeInTheDocument();
  });

  it("renders client cards with developer-test tags and detail links", () => {
    mockClientListQuery({
      data: [
        {
          id: "c1",
          name: "客户 A",
          phone: "13800000000",
          isDeveloperTest: true,
        },
      ],
    });

    render(<ClientListView />);

    expect(screen.getByText("客户 A")).toBeInTheDocument();
    expect(screen.getByText("13800000000")).toBeInTheDocument();
    expect(screen.getByText("测试")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /客户 A/ })).toHaveAttribute("href", "/ops/client/c1");
  });

  it("keeps draft input out of the query until search is submitted", async () => {
    const user = userEvent.setup();
    mockClientListQuery({ data: [] });

    render(<ClientListView />);

    expect(useClientListQueryMock).toHaveBeenLastCalledWith({ keyword: "" });

    await user.type(screen.getByLabelText("搜索"), "星河");
    expect(useClientListQueryMock).toHaveBeenLastCalledWith({ keyword: "" });

    await user.click(screen.getByRole("button", { name: "搜索" }));
    expect(useClientListQueryMock).toHaveBeenLastCalledWith({ keyword: "星河" });
  });
});
