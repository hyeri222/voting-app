import { expect, test } from "@playwright/test";
import { fillPollForm, logInAsOperator, uniqueQuestion } from "./helpers";

test("운영자가 투표를 만들면 새 투표 페이지에 선택지가 입력 순서대로 보인다", async ({ page }) => {
  const question = uniqueQuestion("점심 메뉴");
  await logInAsOperator(page);
  await fillPollForm(page, question, ["짜장면", "짬뽕", "볶음밥"]);
  await page.getByRole("button", { name: "투표 만들기" }).click();

  await expect(page).toHaveURL(/\/polls\/\d+$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(question);
  await expect(page.locator("label:has(input[type=radio])")).toHaveText(["짜장면", "짬뽕", "볶음밥"]);
});

test("선택지가 중복되면 오류가 보이고 입력한 값은 남아 있다", async ({ page }) => {
  const question = uniqueQuestion("중복 선택지");
  await logInAsOperator(page);
  await fillPollForm(page, question, ["사과", "사과"]);
  await page.getByRole("button", { name: "투표 만들기" }).click();

  await expect(page.getByText("선택지가 중복되었습니다.")).toBeVisible();
  await expect(page).toHaveURL("/admin");
  await expect(page.getByPlaceholder("질문")).toHaveValue(question);
  await expect(page.getByPlaceholder("선택지 1", { exact: true })).toHaveValue("사과");
  await expect(page.getByPlaceholder("선택지 2", { exact: true })).toHaveValue("사과");
});

test("공백뿐인 질문으로는 투표를 만들 수 없다", async ({ page }) => {
  await logInAsOperator(page);
  await fillPollForm(page, "   ", ["예", "아니요"]);
  await page.getByRole("button", { name: "투표 만들기" }).click();

  await expect(page.getByText("질문을 입력하세요.")).toBeVisible();
  await expect(page).toHaveURL("/admin");
});

test("선택지 칸은 2개 아래로 줄지 않고 10개 위로 늘지 않는다", async ({ page }) => {
  await logInAsOperator(page);
  const optionFields = page.getByPlaceholder(/^선택지 \d+$/);
  const addButton = page.getByRole("button", { name: "+ 선택지 추가" });

  await expect(optionFields).toHaveCount(2);
  await expect(page.getByRole("button", { name: /^선택지 \d+ 삭제$/ })).toHaveCount(0);

  for (let i = 0; i < 8; i++) await addButton.click();
  await expect(optionFields).toHaveCount(10);
  await expect(addButton).toHaveCount(0);

  await page.getByRole("button", { name: "선택지 10 삭제" }).click();
  await expect(optionFields).toHaveCount(9);
  await expect(addButton).toBeVisible();
});
