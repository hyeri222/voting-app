import { expect, test } from "@playwright/test";
import { castVote, closePoll, createPoll, newVoter, uniqueQuestion } from "./helpers";

test("투표자는 선택지를 고르지 않으면 표를 던질 수 없다", async ({ browser }) => {
  const poll = await createPoll(browser, uniqueQuestion("선택 필수"), ["예", "아니요"]);
  const voter = await newVoter(browser);
  await voter.goto(poll);

  await voter.getByRole("button", { name: "투표하기" }).click();

  await expect(voter.getByRole("button", { name: "투표하기" })).toBeVisible();
  await expect(voter.getByRole("heading", { name: /결과/ })).toHaveCount(0);
});

test("표를 던지면 투표 폼이 사라지고 새로고침해도 다시 나오지 않는다", async ({ browser }) => {
  const poll = await createPoll(browser, uniqueQuestion("한 표"), ["예", "아니요"]);
  const voter = await newVoter(browser);
  await voter.goto(poll);

  await castVote(voter, "예");
  await voter.reload();

  await expect(voter.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(voter.getByRole("button", { name: "투표하기" })).toHaveCount(0);
  await expect(voter.getByRole("radio")).toHaveCount(0);
});

test("한 투표에 표를 던져도 다른 투표에는 따로 표를 던질 수 있다", async ({ browser }) => {
  const first = await createPoll(browser, uniqueQuestion("첫 투표"), ["A", "B"]);
  const second = await createPoll(browser, uniqueQuestion("둘째 투표"), ["C", "D"]);
  const voter = await newVoter(browser);

  await voter.goto(first);
  await castVote(voter, "A");
  await voter.goto(second);

  await expect(voter.getByRole("button", { name: "투표하기" })).toBeVisible();
});

test("마감된 투표에는 투표 폼이 보이지 않는다", async ({ browser }) => {
  const question = uniqueQuestion("마감 투표");
  const poll = await createPoll(browser, question, ["예", "아니요"]);
  await closePoll(browser, question);
  const voter = await newVoter(browser);

  await voter.goto(poll);

  await expect(voter.getByRole("heading", { level: 1 })).toHaveText(question);
  await expect(voter.getByText("마감된 투표입니다.")).toBeVisible();
  await expect(voter.getByRole("button", { name: "투표하기" })).toHaveCount(0);
});
