import { expect, test } from "@playwright/test";
import { createPoll, newVoter, soonDeadline, uniqueQuestion, waitUntilPast } from "./helpers";

test("페이지를 열어 둔 채 마감 시각이 지나면 새로고침 없이 폼이 사라지고 결과가 나타난다", async ({ browser }) => {
  test.slow();
  const { input, at } = soonDeadline();
  const poll = await createPoll(browser, uniqueQuestion("카운트다운"), ["예", "아니요"], { deadline: input });
  const voter = await newVoter(browser);
  await voter.goto(poll);
  await expect(voter.getByText(/분 (미만 )?남음$/)).toBeVisible();
  await expect(voter.getByRole("button", { name: "투표하기" })).toBeVisible();

  await waitUntilPast(voter, at);

  await expect(voter.getByRole("button", { name: "투표하기" })).toHaveCount(0);
  await expect(voter.getByText("마감된 투표입니다.")).toBeVisible();
  await expect(voter.getByRole("heading", { name: /^결과 · 총/ })).toHaveText("결과 · 총 0표");
});
