import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SwitchField } from "./SwitchField";

describe("SwitchField", () => {
  it("emits the next checked value", async () => {
    const onCheckedChange = vi.fn();
    render(<SwitchField label="启用通知" checked={false} onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole("switch", { name: "启用通知" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
