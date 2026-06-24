import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ListRow } from "./ListRow";

describe("ListRow", () => {
  it("renders title, description, value, and calls onClick", async () => {
    const onClick = vi.fn();
    render(<ListRow title="客户名称" description="基础信息" value="MC" onClick={onClick} />);

    expect(screen.getByText("客户名称")).toBeInTheDocument();
    expect(screen.getByText("基础信息")).toBeInTheDocument();
    expect(screen.getByText("MC")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /客户名称/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
