import { expect, test } from "@playwright/test";

test("opens client settings route modes on the same URL", async ({ page }) => {
  await page.goto("/#/ops/client/c1");

  await page.getByRole("button", { name: /客户设置/ }).click();
  await expect(page.getByRole("heading", { name: "客户设置" })).toBeVisible();

  await page.getByRole("button", { name: /名称与备注/ }).click();
  await expect(page.getByRole("heading", { name: "名称与备注" })).toBeVisible();
  await expect(page).toHaveURL(/\/ops\/client\/c1$/);
});
