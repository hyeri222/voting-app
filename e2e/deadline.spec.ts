import { expect, test } from "@playwright/test";
import { fillPollForm, logInAsOperator, uniqueQuestion } from "./helpers";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** "YYYY-MM-DDTHH:mm" in Korea time for a moment `offsetMs` from now. */
function kstInput(offsetMs: number) {
  return new Date(Date.now() + offsetMs + 9 * HOUR).toISOString().slice(0, 16);
}

/** Reads a datetime-local value as Korea time. */
function fromKstInput(value: string) {
  return new Date(`${value}:00+09:00`).getTime();
}

test("마감 시각 칸의 기본값은 24시간 뒤다", async ({ page }) => {
  await logInAsOperator(page);
  const value = await page.getByLabel("마감 시각").inputValue();
  const diff = fromKstInput(value) - Date.now();

  expect(diff).toBeGreaterThan(24 * HOUR - 2 * 60 * 1000);
  expect(diff).toBeLessThanOrEqual(24 * HOUR);
});

test("30일보다 먼 마감 시각은 오류로 막히고 입력한 값은 남는다", async ({ page }) => {
  const question = uniqueQuestion("너무 먼 마감");
  const tooFar = kstInput(31 * DAY);
  await logInAsOperator(page);
  await fillPollForm(page, question, ["예", "아니요"]);
  await page.getByLabel("마감 시각").fill(tooFar);
  await page.getByRole("button", { name: "투표 만들기" }).click();

  await expect(page.getByText("마감 시각은 30일 이내여야 합니다.")).toBeVisible();
  await expect(page).toHaveURL("/operator");
  await expect(page.getByPlaceholder("질문")).toHaveValue(question);
  await expect(page.getByLabel("마감 시각")).toHaveValue(tooFar);
});

test("이미 지난 마감 시각은 오류로 막힌다", async ({ page }) => {
  await logInAsOperator(page);
  await fillPollForm(page, uniqueQuestion("지난 마감"), ["예", "아니요"]);
  await page.getByLabel("마감 시각").fill(kstInput(-HOUR));
  await page.getByRole("button", { name: "투표 만들기" }).click();

  await expect(page.getByText(/^마감 시각은 지금부터 .+ 뒤보다 늦어야 합니다\.$/)).toBeVisible();
  await expect(page).toHaveURL("/operator");
});

test("새 투표의 페이지, 홈 목록, 운영 화면에 마감 시각과 남은 시간이 보인다", async ({ page }) => {
  const question = uniqueQuestion("마감 표시");
  // Two days from now at 18:00 Korea time.
  const deadline = `${kstInput(2 * DAY).slice(0, 10)}T18:00`;
  await logInAsOperator(page);
  await fillPollForm(page, question, ["예", "아니요"]);
  await page.getByLabel("마감 시각").fill(deadline);
  await page.getByRole("button", { name: "투표 만들기" }).click();
  await expect(page).toHaveURL(/\/polls\/\d+$/);

  const month = Number(deadline.slice(5, 7));
  const day = Number(deadline.slice(8, 10));
  const deadlineText = new RegExp(String.raw`${month}월 ${day}일 \([일월화수목금토]\) 18:00 마감`);
  const remaining = /\d+일 \d+시간 남음/;

  await expect(page.getByRole("main")).toContainText(deadlineText);
  await expect(page.getByRole("main")).toContainText(remaining);

  await page.goto("/");
  const listItem = page.getByRole("listitem").filter({ hasText: question });
  await expect(listItem).toContainText(remaining);

  await page.goto("/operator");
  const operatorRow = page.getByRole("listitem").filter({ hasText: question });
  await expect(operatorRow).toContainText(deadlineText);
});
