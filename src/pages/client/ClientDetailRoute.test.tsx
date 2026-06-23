import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientDetailRoute } from "./ClientDetailRoute";

const navigateMock = vi.fn();
const historyBackMock = vi.fn();
let routeState: Record<string, unknown> = {};
let routeParams: { clientId?: string } = { clientId: "c1" };

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
  useParams: () => routeParams,
  useRouter: () => ({ history: { back: historyBackMock } }),
  useRouterState: <T,>({
    select,
  }: {
    select: (state: { location: { pathname: string; state: Record<string, unknown> } }) => T;
  }) => select({ location: { pathname: "/ops/client/c1", state: routeState } }),
}));

function renderWithQuery(ui: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  return {
    ...view,
    rerender: (nextUi: ReactNode) =>
      view.rerender(<QueryClientProvider client={queryClient}>{nextUi}</QueryClientProvider>),
  };
}

describe("ClientDetailRoute", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    historyBackMock.mockReset();
    routeState = {};
    routeParams = { clientId: "c1" };
  });

  it("pushes settings mode into route state from the detail home page", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ClientDetailRoute />);

    expect(await screen.findByText("客户 A")).toBeInTheDocument();
    expect(screen.getByText("测试客户")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /客户设置/ }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/ops/client/$clientId",
      params: { clientId: "c1" },
      state: expect.any(Function),
    });

    const settingsState = navigateMock.mock.calls[0][0].state({ __TSR_index: 0 });
    expect(settingsState).toMatchObject({ routeMode: "setting" });
    expect(screen.queryByRole("button", { name: "保存" })).not.toBeInTheDocument();
  });

  it("renders the legacy default entries and web destination fallback", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ClientDetailRoute />);

    expect(await screen.findByRole("button", { name: /用餐计划/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /目的地/ }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "此功能专为移动端设计，请移步 APP 继续使用。",
    );
  });

  it("falls back to the default detail page for an unknown route mode", async () => {
    routeState = { routeMode: "notMigratedYet" };

    renderWithQuery(<ClientDetailRoute />);

    expect(await screen.findByRole("heading", { name: "客户详情" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /用餐计划/ })).toBeInTheDocument();
  });

  it("passes route params into the detail query", async () => {
    routeParams = { clientId: "c2" };

    renderWithQuery(<ClientDetailRoute />);

    expect(await screen.findByText("客户 B")).toBeInTheDocument();
    expect(screen.queryByText("测试客户")).not.toBeInTheDocument();
  });

  it("pushes name and remark mode from the settings page row", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "setting" };

    renderWithQuery(<ClientDetailRoute />);

    await user.click(await screen.findByRole("button", { name: /名称与备注/ }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/ops/client/$clientId",
      params: { clientId: "c1" },
      state: expect.any(Function),
    });

    const nameAndRemarkState = navigateMock.mock.calls[0][0].state({ __TSR_index: 0 });
    expect(nameAndRemarkState).toMatchObject({ routeMode: "nameAndRemark" });
  });

  it("pushes simple setting modes from the settings page rows", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "setting" };

    renderWithQuery(<ClientDetailRoute />);

    await user.click(await screen.findByRole("button", { name: /企业公告/ }));
    const notificationState = navigateMock.mock.calls[0][0].state({ __TSR_index: 0 });
    expect(notificationState).toMatchObject({ routeMode: "notification" });

    await user.click(screen.getByRole("button", { name: /密码策略设置/ }));
    const passwordState = navigateMock.mock.calls[1][0].state({ __TSR_index: 0 });
    expect(passwordState).toMatchObject({ routeMode: "passwordSetting" });

    await user.click(screen.getByRole("button", { name: /客户端最低版本/ }));
    const appVersionState = navigateMock.mock.calls[2][0].state({ __TSR_index: 0 });
    expect(appVersionState).toMatchObject({ routeMode: "appVersion" });
  });

  it("pushes meal setting modes from the settings page rows", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "setting" };

    renderWithQuery(<ClientDetailRoute />);

    await user.click(await screen.findByRole("button", { name: /餐点使用模式/ }));
    const mealPointState = navigateMock.mock.calls[0][0].state({ __TSR_index: 0 });
    expect(mealPointState).toMatchObject({ routeMode: "mealPoint" });

    await user.click(screen.getByRole("button", { name: /餐次卡片/ }));
    const mealTypeState = navigateMock.mock.calls[1][0].state({ __TSR_index: 0 });
    expect(mealTypeState).toMatchObject({ routeMode: "mealType" });

    await user.click(screen.getByRole("button", { name: /用餐组/ }));
    const mealGroupState = navigateMock.mock.calls[2][0].state({ __TSR_index: 0 });
    expect(mealGroupState).toMatchObject({ routeMode: "mealGroup" });
  });

  it("opens plan details from the meal plans mode", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "plan" };

    renderWithQuery(<ClientDetailRoute />);

    await user.click(await screen.findByRole("button", { name: /方案 A/ }));

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/ops/client/$clientId/plan/$planId",
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

  it("pushes edit mode from the name and remark read page", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "nameAndRemark" };

    renderWithQuery(<ClientDetailRoute />);

    expect(await screen.findByText("名称与备注")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "编辑" }));

    const editState = navigateMock.mock.calls[0][0].state({ __TSR_index: 0 });
    expect(editState).toMatchObject({ routeMode: "nameAndRemarkEdit" });
  });

  it("renders support setting mode", async () => {
    routeState = { routeMode: "support" };
    renderWithQuery(<ClientDetailRoute />);

    expect(await screen.findByLabelText("客服名称")).toHaveValue("客服小美");
  });

  it("renders notification setting mode with cancel and validation error behavior", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "notification" };
    renderWithQuery(<ClientDetailRoute />);

    const titleField = await screen.findByLabelText("公告标题");
    expect(titleField).toHaveValue("午餐预订提醒");

    await user.clear(titleField);
    expect(screen.getByText("公告标题不能为空")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(historyBackMock).toHaveBeenCalledTimes(1);
  });

  it("renders password setting mode with editable validation", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "passwordSetting" };
    renderWithQuery(<ClientDetailRoute />);

    expect(
      await screen.findByText("默认规则要求同时包含大小写字母和数字，长度为 8-40 位。"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: /成员定期修改密码/ }));
    const periodField = screen.getByLabelText("修改周期");
    await user.clear(periodField);
    await user.type(periodField, "0");

    expect(screen.getByText("修改周期需为 1-365 天")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
  });

  it("renders app version setting mode and saves a custom version", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "appVersion" };
    renderWithQuery(<ClientDetailRoute />);

    expect(await screen.findByText(/全部用餐人员将强制升级/)).toBeInTheDocument();

    await user.click(screen.getAllByRole("radio", { name: /自定义/ })[0]);
    await user.selectOptions(screen.getByLabelText("iOS 自定义版本"), "4.40.0");
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(historyBackMock).toHaveBeenCalledTimes(1));
  });

  it("renders manager setting mode", async () => {
    routeState = { routeMode: "manager" };
    renderWithQuery(<ClientDetailRoute />);

    expect(await screen.findByText("管理权限")).toBeInTheDocument();
    expect(screen.getByText("owner-a@example.com")).toBeInTheDocument();
  });

  it("renders structured client setting modes", async () => {
    routeState = { routeMode: "department" };
    const view = renderWithQuery(<ClientDetailRoute />);

    expect(await screen.findByText("手动创建的部门")).toBeInTheDocument();
    expect(screen.getByText("飞书同步部门")).toBeInTheDocument();

    routeState = { routeMode: "costCenter" };
    view.rerender(<ClientDetailRoute />);
    expect(
      await screen.findByText("成本中心用于成员消费归集。停用项保留展示，不能在本基础切片编辑。"),
    ).toBeInTheDocument();
    expect(screen.getByText("总部成本中心")).toBeInTheDocument();

    routeState = { routeMode: "fieldSetting" };
    view.rerender(<ClientDetailRoute />);
    expect(await screen.findByText("成员字段")).toBeInTheDocument();
    expect(screen.getByText("指定邮箱后缀：example.com")).toBeInTheDocument();
  });

  it("renders meal setting mode with cancel and validation error behavior", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "mealType" };
    renderWithQuery(<ClientDetailRoute />);

    expect(await screen.findByText("餐次卡片")).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "早餐" }));
    await user.click(screen.getByRole("checkbox", { name: "午餐" }));
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(screen.getByText("至少选择一个餐次")).toBeInTheDocument();
    expect(historyBackMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(historyBackMock).toHaveBeenCalledTimes(1);
  });

  it("adds a Mc staff manager from the manager setting mode", async () => {
    const user = userEvent.setup();
    routeState = { routeMode: "manager" };
    renderWithQuery(<ClientDetailRoute />);

    await user.type(await screen.findByLabelText("搜索员工"), "方案");
    await user.click(await screen.findByRole("checkbox", { name: "方案顾问 选择" }));
    await user.click(screen.getByRole("button", { name: /添加 1/ }));

    expect(screen.getByText("plan-consultant@example.com")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "保存" }));
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
