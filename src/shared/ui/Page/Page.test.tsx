import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Page } from "./Page";

describe("Page", () => {
  it("renders a mobile H5 page title and content", () => {
    render(<Page title="客户列表">内容</Page>);
    expect(screen.getByRole("heading", { name: "客户列表" })).toBeInTheDocument();
    expect(screen.getByText("内容")).toBeInTheDocument();
  });
});
