import { expect, test } from "@playwright/test";
import { closePoll, createPoll, uniqueQuestion } from "./helpers";

const kstInput = (offsetMs: number) => new Date(Date.now() + offsetMs + 9 * 3_600_000).toISOString().slice(0, 16);
const DAY = 24 * 3_600_000;

test("홈 목록은 열린 투표를 마감 시각이 가까운 순으로 먼저, 그 아래에 마감된 투표를 보여 준다", async ({
  browser,
  page,
}) => {
  const later = uniqueQuestion("이틀 뒤 마감");
  const sooner = uniqueQuestion("하루 뒤 마감");
  const closed = uniqueQuestion("이미 마감");
  // Created in the reverse of the expected order, so "newest first" would fail.
  await createPoll(browser, sooner, ["예", "아니요"], { deadline: kstInput(DAY) });
  await createPoll(browser, later, ["예", "아니요"], { deadline: kstInput(2 * DAY) });
  await createPoll(browser, closed, ["예", "아니요"], { deadline: kstInput(DAY / 2) });
  await closePoll(browser, closed);

  await page.goto("/");
  const questions = await page.getByRole("listitem").allTextContents();
  const position = (q: string) => questions.findIndex((text) => text.includes(q));

  expect(position(sooner)).toBeGreaterThanOrEqual(0);
  expect(position(sooner)).toBeLessThan(position(later));
  expect(position(later)).toBeLessThan(position(closed));
});
