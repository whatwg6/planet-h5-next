import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("only renders when open and emits cancel and confirm actions", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const { rerender } = render(
      <ConfirmDialog open={false} title="放弃修改？" onCancel={onCancel} onConfirm={onConfirm} />,
    );

    expect(screen.queryByRole("dialog", { name: "放弃修改？" })).not.toBeInTheDocument();

    rerender(<ConfirmDialog open title="放弃修改？" onCancel={onCancel} onConfirm={onConfirm} />);

    expect(screen.getByRole("dialog", { name: "放弃修改？" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "取消" }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "确认" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
