import { expect, test } from "@playwright/test";

test("opens order detail and member order list", async ({ page }) => {
  await page.goto("/#/ops/client/c1/plan/p1");

  await page.getByRole("button", { name: "查看订单" }).click();
  await expect(page).toHaveURL(/\/ops\/client\/c1\/plan\/p1\/order\//);
  await expect(page.getByRole("heading", { name: /订单/ })).toBeVisible();
  await expect(page.getByText("订单状态")).toBeVisible();

  await page.getByRole("button", { name: "查看总订单" }).click();
  await expect(page.getByRole("heading", { name: "成员订单" })).toBeVisible();
  await expect(page.getByText("王小星")).toBeVisible();
});
