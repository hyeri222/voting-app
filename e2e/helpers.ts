import { expect, type Browser, type Page } from "@playwright/test";

/** A 질문 no other test will use, so tests can run in parallel against one database. */
export function uniqueQuestion(label: string) {
  return `${label} ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function logInAsOperator(page: Page) {
  await page.goto("/login");
  // playwright.config.ts loads .env.local, so this is the app's real ADMIN_PASSWORD.
  await page.getByPlaceholder("비밀번호").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL("/operator");
}

/** Fills the 새 투표 form on the 운영 화면; the page must already be there. */
export async function fillPollForm(page: Page, question: string, options: string[]) {
  await page.getByPlaceholder("질문").fill(question);
  for (let i = 2; i < options.length; i++) {
    await page.getByRole("button", { name: "+ 선택지 추가" }).click();
  }
  for (const [i, option] of options.entries()) {
    await page.getByPlaceholder(`선택지 ${i + 1}`, { exact: true }).fill(option);
  }
}

/** A datetime-local value ("YYYY-MM-DDTHH:mm") in Korea time for a moment `offsetMs` from now. */
export function kstInput(offsetMs: number) {
  return new Date(Date.now() + offsetMs + 9 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

/**
 * A 마감 시각 that passes soon: the first whole minute at least 10 seconds away (the form has
 * minute precision and the E2E server's minimum lead is 5 seconds). Up to ~70 seconds of waiting.
 */
export function soonDeadline() {
  const at = Math.ceil((Date.now() + 10_000) / 60_000) * 60_000;
  const input = kstInput(at - Date.now());
  return { input, at };
}

/** Waits until a moment given in epoch ms has passed, plus a margin for clock differences. */
export async function waitUntilPast(page: Page, at: number) {
  await page.waitForTimeout(Math.max(0, at - Date.now()) + 2_000);
}

/** Creates a 투표 as the 운영자 in a throwaway context and returns its URL path. */
export async function createPoll(
  browser: Browser,
  question: string,
  options: string[],
  { deadline }: { deadline?: string } = {},
) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await logInAsOperator(page);
  await fillPollForm(page, question, options);
  if (deadline) await page.getByLabel("마감 시각").fill(deadline);
  await page.getByRole("button", { name: "투표 만들기" }).click();
  await expect(page).toHaveURL(/\/polls\/\d+$/);
  const path = new URL(page.url()).pathname;
  await context.close();
  return path;
}

/** Closes (마감) a 투표 as the 운영자 from the 운영 화면. */
export async function closePoll(browser: Browser, question: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await logInAsOperator(page);
  const row = page.getByRole("listitem").filter({ hasText: question });
  await row.getByRole("button", { name: "마감" }).click();
  await expect(row.getByRole("button", { name: "마감" })).toHaveCount(0);
  await context.close();
}

/** A new browser context is a new 투표자 (fresh cookies). */
export async function newVoter(browser: Browser) {
  const context = await browser.newContext();
  return context.newPage();
}

export async function castVote(page: Page, optionLabel: string) {
  await page.getByRole("radio", { name: optionLabel }).check();
  await page.getByRole("button", { name: "투표하기" }).click();
  await expect(page.getByRole("button", { name: "투표하기" })).toHaveCount(0);
}
