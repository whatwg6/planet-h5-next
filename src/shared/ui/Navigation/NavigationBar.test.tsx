import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NavigationBar } from "./NavigationBar";

describe("NavigationBar", () => {
  it("renders the title without a back button by default", () => {
    render(<NavigationBar title="客户列表" />);

    expect(screen.getByRole("heading", { name: "客户列表" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "返回" })).not.toBeInTheDocument();
  });

  it("calls onBack from the back button", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<NavigationBar title="客户详情" onBack={onBack} />);

    await user.click(screen.getByRole("button", { name: "返回" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
