import { expect, test } from "@playwright/test";

test("renders the client list route", async ({ page }) => {
  await page.goto("/ops/client");

  await expect(page.getByRole("heading", { name: "4.0 客户" })).toBeVisible();
  await expect(page.getByLabel("搜索")).toBeVisible();
  await expect(page.getByText("客户 A")).toBeVisible();
});

test("navigates from client list to detail and back", async ({ page }) => {
  await page.goto("/ops/client");

  await page.getByRole("link", { name: /客户 A/ }).click();
  await expect(page).toHaveURL(/\/ops\/client\/c1/);
  await expect(page.getByRole("heading", { name: "客户详情" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/ops\/client$/);
  await expect(page.getByRole("heading", { name: "4.0 客户" })).toBeVisible();
});
