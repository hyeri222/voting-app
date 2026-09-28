import { expect, test } from "@playwright/test";
import { logInAsOperator } from "./helpers";

test("로그아웃 상태에서 운영 화면에 들어가면 로그인 페이지로 이동한다", async ({ page }) => {
  await page.goto("/operator");
  await expect(page).toHaveURL("/login");
});

test("비밀번호가 틀리면 로그인되지 않고 오류가 보인다", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("비밀번호").fill("wrong-password");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page.getByText("비밀번호가 올바르지 않습니다.")).toBeVisible();
  await page.goto("/operator");
  await expect(page).toHaveURL("/login");
});

test("운영자는 로그인했다가 로그아웃할 수 있다", async ({ page }) => {
  await logInAsOperator(page);
  await expect(page.getByRole("banner").getByRole("link", { name: "운영" })).toBeVisible();

  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/operator");
  await expect(page).toHaveURL("/login");
});

test("위조한 세션 쿠키로는 운영 화면에 들어갈 수 없다", async ({ page, context, baseURL }) => {
  const farFuture = Date.now() + 365 * 24 * 60 * 60 * 1000;
  await context.addCookies([{ name: "operator_session", value: `${farFuture}.forged`, url: baseURL! }]);

  await page.goto("/operator");
  await expect(page).toHaveURL("/login");
});
