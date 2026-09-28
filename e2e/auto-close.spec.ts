import { expect, test } from "@playwright/test";
import {
  castVote,
  createPoll,
  logInAsOperator,
  newVoter,
  soonDeadline,
  uniqueQuestion,
  waitUntilPast,
} from "./helpers";

test("마감 시각이 지난 투표는 자동으로 마감된다", async ({ browser, page }) => {
  test.slow();
  const question = uniqueQuestion("자동 마감");
  const { input, at } = soonDeadline();
  const poll = await createPoll(browser, question, ["예", "아니요"], { deadline: input });
  await waitUntilPast(page, at);

  const voter = await newVoter(browser);
  await voter.goto(poll);
  await expect(voter.getByText("마감된 투표입니다.")).toBeVisible();
  await expect(voter.getByRole("button", { name: "투표하기" })).toHaveCount(0);

  await voter.goto("/");
  await expect(voter.getByRole("listitem").filter({ hasText: question })).toContainText("마감");

  await logInAsOperator(page);
  const row = page.getByRole("listitem").filter({ hasText: question });
  await expect(row).toContainText("마감");
  await expect(row.getByRole("button", { name: "마감" })).toHaveCount(0);
});

test("마감 시각 전에 열어 둔 폼으로 늦게 제출해도 표가 들어가지 않는다", async ({ browser }) => {
  test.slow();
  const { input, at } = soonDeadline();
  const poll = await createPoll(browser, uniqueQuestion("늦은 제출"), ["예", "아니요"], { deadline: input });
  const voter = await newVoter(browser);
  await voter.goto(poll);
  await voter.getByRole("radio", { name: "예" }).check();

  await waitUntilPast(voter, at);
  await voter.getByRole("button", { name: "투표하기" }).click();

  await expect(voter.getByText("마감된 투표입니다.")).toBeVisible();
  await expect(voter.getByRole("heading", { name: /^결과 · 총/ })).toHaveText("결과 · 총 0표");
  await expect(voter.getByText("(내 선택)")).toHaveCount(0);
});
