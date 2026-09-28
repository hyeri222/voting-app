import { expect, test, type Page } from "@playwright/test";
import { castVote, closePoll, createPoll, logInAsOperator, newVoter, uniqueQuestion } from "./helpers";

const resultsHeading = (page: Page) => page.getByRole("heading", { name: /^결과 · 총/ });
const resultRow = (page: Page, label: string) =>
  page.getByRole("listitem").filter({ has: page.getByText(label, { exact: false }) });

test("표를 던지기 전에는 결과가 보이지 않는다", async ({ browser }) => {
  const poll = await createPoll(browser, uniqueQuestion("결과 숨김"), ["예", "아니요"]);
  const voter = await newVoter(browser);

  await voter.goto(poll);

  await expect(voter.getByRole("button", { name: "투표하기" })).toBeVisible();
  await expect(resultsHeading(voter)).toHaveCount(0);
  await expect(voter.getByText(/\d+표 · \d+%/)).toHaveCount(0);
});

test("표를 던지면 선택지별 표 수·퍼센트·총 표 수와 내 선택이 보인다", async ({ browser }) => {
  const poll = await createPoll(browser, uniqueQuestion("결과 공개"), ["고양이", "강아지", "앵무새"]);
  const voter = await newVoter(browser);
  await voter.goto(poll);

  await castVote(voter, "강아지");

  await expect(resultsHeading(voter)).toHaveText("결과 · 총 1표");
  await expect(resultRow(voter, "강아지")).toContainText("강아지 (내 선택)");
  await expect(resultRow(voter, "강아지")).toContainText("1표 · 100%");
  await expect(resultRow(voter, "고양이")).toContainText("0표 · 0%");
  await expect(resultRow(voter, "고양이")).not.toContainText("내 선택");
  await expect(resultRow(voter, "앵무새")).toContainText("0표 · 0%");
});

test("투표자 여러 명의 표가 정확히 집계된다", async ({ browser }) => {
  const poll = await createPoll(browser, uniqueQuestion("집계"), ["빨강", "파랑"]);
  for (const option of ["빨강", "빨강", "파랑", "빨강"]) {
    const voter = await newVoter(browser);
    await voter.goto(poll);
    await castVote(voter, option);
    await voter.context().close();
  }

  const viewer = await newVoter(browser);
  await viewer.goto(poll);
  await castVote(viewer, "파랑");

  // viewer 포함: 빨강 3표, 파랑 2표 → 60% / 40%
  await expect(resultsHeading(viewer)).toHaveText("결과 · 총 5표");
  await expect(resultRow(viewer, "빨강")).toContainText("3표 · 60%");
  await expect(resultRow(viewer, "파랑")).toContainText("2표 · 40%");
});

test("운영자는 표를 던지지 않아도 결과를 본다", async ({ browser, page }) => {
  const poll = await createPoll(browser, uniqueQuestion("운영자 결과"), ["예", "아니요"]);
  const voter = await newVoter(browser);
  await voter.goto(poll);
  await castVote(voter, "아니요");

  await logInAsOperator(page);
  await page.goto(poll);

  await expect(resultsHeading(page)).toHaveText("결과 · 총 1표");
  await expect(resultRow(page, "아니요")).toContainText("1표 · 100%");
  await expect(page.getByText("(내 선택)")).toHaveCount(0);
});

test("마감된 투표는 표를 던지지 않은 투표자도 마감 안내와 결과를 본다", async ({ browser }) => {
  const question = uniqueQuestion("마감 결과");
  const poll = await createPoll(browser, question, ["예", "아니요"]);
  const voted = await newVoter(browser);
  await voted.goto(poll);
  await castVote(voted, "예");

  await closePoll(browser, question);

  const late = await newVoter(browser);
  await late.goto(poll);
  await expect(late.getByText("마감된 투표입니다.")).toBeVisible();
  await expect(resultsHeading(late)).toHaveText("결과 · 총 1표");
  await expect(resultRow(late, "예")).toContainText("1표 · 100%");
  await expect(late.getByText("(내 선택)")).toHaveCount(0);

  await voted.reload();
  await expect(resultsHeading(voted)).toHaveText("결과 · 총 1표");
});

test("표가 가장 많은 선택지 하나에만 1위가 표시된다", async ({ browser }) => {
  const poll = await createPoll(browser, uniqueQuestion("1위"), ["사과", "배", "감"]);
  for (const option of ["배", "배"]) {
    const voter = await newVoter(browser);
    await voter.goto(poll);
    await castVote(voter, option);
    await voter.context().close();
  }
  const viewer = await newVoter(browser);
  await viewer.goto(poll);
  await castVote(viewer, "사과");

  await expect(viewer.getByText("1위", { exact: true })).toHaveCount(1);
  await expect(resultRow(viewer, "배")).toContainText("1위");
  await expect(viewer.locator("li").filter({ hasText: "표 ·" })).toHaveText([/^사과/, /^배/, /^감/]);
});

test("공동 1위면 동점인 선택지마다 1위가 표시된다", async ({ browser }) => {
  const poll = await createPoll(browser, uniqueQuestion("공동 1위"), ["빨강", "파랑", "초록"]);
  const first = await newVoter(browser);
  await first.goto(poll);
  await castVote(first, "빨강");
  const viewer = await newVoter(browser);
  await viewer.goto(poll);
  await castVote(viewer, "파랑");

  await expect(viewer.getByText("1위", { exact: true })).toHaveCount(2);
  await expect(resultRow(viewer, "빨강")).toContainText("1위");
  await expect(resultRow(viewer, "파랑")).toContainText("1위");
  await expect(resultRow(viewer, "초록")).not.toContainText("1위");
});

test("표가 없으면 1위가 표시되지 않는다", async ({ browser, page }) => {
  const poll = await createPoll(browser, uniqueQuestion("0표"), ["예", "아니요"]);
  await logInAsOperator(page);
  await page.goto(poll);

  await expect(resultsHeading(page)).toHaveText("결과 · 총 0표");
  await expect(page.getByText("1위", { exact: true })).toHaveCount(0);
});

test("결과 그래프의 막대 길이는 표 수에 비례한다", async ({ browser }) => {
  const poll = await createPoll(browser, uniqueQuestion("그래프"), ["짜장", "짬뽕"]);
  for (const option of ["짜장", "짜장", "짬뽕"]) {
    const voter = await newVoter(browser);
    await voter.goto(poll);
    await castVote(voter, option);
    await voter.context().close();
  }
  const viewer = await newVoter(browser);
  await viewer.goto(poll);
  await castVote(viewer, "짜장");

  // 짜장 3표(75%), 짬뽕 1표(25%)
  const big = viewer.getByRole("meter", { name: "짜장" });
  const small = viewer.getByRole("meter", { name: "짬뽕" });
  await expect(big).toHaveAttribute("aria-valuenow", "75");
  await expect(small).toHaveAttribute("aria-valuenow", "25");
  const [bigBox, smallBox] = [await big.boundingBox(), await small.boundingBox()];
  expect(bigBox!.width / smallBox!.width).toBeGreaterThan(2.7);
  expect(bigBox!.width / smallBox!.width).toBeLessThan(3.3);
});
