import { expect, test } from "@playwright/test";
import { createPoll, logInAsOperator, uniqueQuestion } from "./helpers";

test("모든 페이지 하단에 만든 사람이 보인다", async ({ browser, page }) => {
  const poll = await createPoll(browser, uniqueQuestion("만든 사람"), ["예", "아니요"]);
  const credit = page.getByRole("contentinfo");

  for (const path of ["/", poll, "/login"]) {
    await page.goto(path);
    await expect(credit).toHaveText("만든 사람: 이혜리");
  }

  await logInAsOperator(page);
  await expect(credit).toHaveText("만든 사람: 이혜리");
});
