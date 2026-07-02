import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tree, type TreeNode } from "./Tree";

const nodes: TreeNode[] = [
  {
    id: "hq",
    label: "总部",
    children: [
      { id: "product", label: "产品部" },
      {
        id: "sales",
        label: "销售部",
        children: [{ id: "east", label: "华东区" }],
      },
    ],
  },
];

describe("Tree", () => {
  it("renders nested nodes and lets a branch collapse and expand", async () => {
    render(<Tree nodes={nodes} defaultExpandedIds={["hq", "sales"]} />);

    expect(screen.getByText("总部")).toBeInTheDocument();
    expect(screen.getByText("产品部")).toBeInTheDocument();
    expect(screen.getByText("华东区")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "收起 销售部" }));
    expect(screen.queryByText("华东区")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "展开 销售部" }));
    expect(screen.getByText("华东区")).toBeInTheDocument();
  });
});
