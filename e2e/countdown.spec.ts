import { expect, test } from "@playwright/test";
import { createPoll, kstInput, newVoter, soonDeadline, uniqueQuestion, waitUntilPast } from "./helpers";

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

test("마감 시각이 25일 넘게 남은 투표도 페이지가 계속 새로고침되지 않는다", async ({ browser }) => {
  const farAway = kstInput(29 * 24 * 3_600_000);
  const poll = await createPoll(browser, uniqueQuestion("먼 마감"), ["예", "아니요"], { deadline: farAway });
  const voter = await newVoter(browser);
  let pollRequests = 0;
  voter.on("request", (request) => {
    if (new URL(request.url()).pathname === poll) pollRequests++;
  });
  await voter.goto(poll);
  await voter.waitForTimeout(5_000);

  // One navigation, no refresh loop.
  expect(pollRequests).toBeLessThanOrEqual(2);
  await expect(voter.getByRole("button", { name: "투표하기" })).toBeVisible();
});
