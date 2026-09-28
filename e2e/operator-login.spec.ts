import { expect, test } from "@playwright/test";
import { OPERATOR, logInAsOperator } from "./helpers";

test("로그아웃 상태에서 운영 화면에 들어가면 로그인 페이지로 이동한다", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL("/login");
});

test("비밀번호가 틀리면 로그인되지 않고 오류가 보인다", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("아이디").fill(OPERATOR.username);
  await page.getByPlaceholder("비밀번호").fill("wrong-password");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page.getByText("아이디 또는 비밀번호가 올바르지 않습니다.")).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL("/login");
});

test("운영자는 로그인했다가 로그아웃할 수 있다", async ({ page }) => {
  await logInAsOperator(page);
  await expect(page.getByRole("banner")).toContainText(OPERATOR.username);

  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/admin");
  await expect(page).toHaveURL("/login");
});
