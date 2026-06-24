import { expect, test } from "@playwright/test";

test("opens and saves a plan setting mode", async ({ page }) => {
  await page.goto("/#/ops/client/c1/plan/p1/setting");

  await page.getByRole("button", { name: /基础信息/ }).click();
  await expect(page.getByRole("heading", { name: "基础信息" })).toBeVisible();
  await expect(page).toHaveURL(/\/ops\/client\/c1\/plan\/p1\/setting$/);

  await page.locator('input[name="owner"]').fill("运营 E2E");
  await page.getByRole("button", { name: "保存" }).nth(1).click();
  await expect(page.getByRole("status")).toContainText("已保存");
});
