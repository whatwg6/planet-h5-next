import { expect, test } from "@playwright/test";

test("renders the client list route", async ({ page }) => {
  await page.goto("/ops/client");

  await expect(page.getByRole("heading", { name: "4.0 客户" })).toBeVisible();
  await expect(page.getByLabel("搜索")).toBeVisible();
  await expect(page.getByText("客户 A")).toBeVisible();
});
