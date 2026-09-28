# 마감 시각, 결과 막대 개선, 만든 사람 표시

Status: ready-for-agent

## Problem Statement

동아리 회장이 "투표가 계속 열려 있어서 사람들이 참여를 안 한다"고 했다. 지금 투표는 운영자가 직접 마감 버튼을 누르기 전까지 끝나지 않는다. 그래서 투표자는 언제까지 참여해야 하는지 모르고, 급할 게 없으니 미룬다. 또 참여하지 않은 사람은 투표가 끝난 뒤에도 결과를 볼 수 없어서, 투표가 어떻게 끝났는지 공유되지 않는다.

결과 화면은 선택지별 막대와 퍼센트를 보여 주지만, 어느 선택지가 이겼는지 한눈에 드러나지 않는다.

앱을 만든 사람(이혜리)이 누구인지도 화면 어디에도 나오지 않는다.

## Solution

- 운영자는 투표를 만들 때 **마감 시각**을 반드시 정한다. 마감 시각이 지나면 투표는 자동으로 **마감**된다. 운영자는 그 전에 직접 마감할 수도 있다. 마감 시각은 만든 뒤에 바꿀 수 없다.
- 투표자는 목록과 투표 페이지에서 정확한 마감 시각과 "N시간 남음" 같은 남은 시간을 본다. 남은 시간은 페이지를 열어 둔 동안 줄어들고, 마감 시각이 되면 투표 폼이 사라진다.
- 홈 목록은 열린 투표를 마감 시각이 가까운 순으로 먼저 보여 주고, 그 아래에 마감된 투표를 보여 준다.
- 마감된 투표의 결과는 누구나 볼 수 있다. 열린 투표의 결과는 지금처럼 표를 던진 투표자와 운영자만 본다.
- 결과 막대에서 1위 선택지를 강조한다. 공동 1위는 모두 강조한다.
- 모든 페이지 하단에 "만든 사람: 이혜리"를 항상 보여 준다.

## User Stories

### 운영자: 마감 시각 정하기

1. As an 운영자, I want to set a 마감 시각 when creating a 투표, so that every 투표 has a clear end.
2. As an 운영자, I want the 마감 시각 to be required, so that I can't accidentally create a 투표 that stays open forever.
3. As an 운영자, I want the 마감 시각 field prefilled with 24 hours from now, so that quick 투표 need no extra effort.
4. As an 운영자, I want to pick the 마감 시각 as a date and time, so that it matches how the club announces deadlines ("금요일 밤 12시까지").
5. As an 운영자, I want the 마감 시각 I enter to be read as Korea time (KST), so that what I type is what 투표자 see.
6. As an 운영자, I want an error when the 마감 시각 is less than 5 minutes from now, so that a past or mistyped time doesn't create a 투표 that is already over.
7. As an 운영자, I want an error when the 마감 시각 is more than 30 days away, so that 투표 don't drift back into being open indefinitely.
8. As an 운영자, I want my typed 질문, 선택지 and 마감 시각 kept when creating fails validation, so that I only fix the mistake.
9. As an 운영자, I want to still 마감 a 투표 myself before its 마감 시각, so that I can end it early when needed.
10. As an 운영자, I want the 마감 시각 to be fixed once the 투표 is created, so that 투표자 can trust the announced deadline.
11. As an 운영자, I want each 투표 on the 운영 화면 to show its 마감 시각 or that it is 마감, so that I can manage 투표 at a glance.
12. As an 운영자, I want the 마감 button hidden for 투표 that are already 마감 (by me or by the 마감 시각), so that I'm not offered a no-op.

### 투표자: 마감 시각 보기

13. As a 투표자, I want to see a 투표's exact 마감 시각 in Korea time (e.g. "9월 30일 (화) 18:00 마감"), so that I know the deadline.
14. As a 투표자, I want to see how much time is left (e.g. "2일 3시간 남음", "45분 남음"), so that I feel the urgency to vote now.
15. As a 투표자, I want the remaining time to keep counting down while the page is open, so that it stays accurate.
16. As a 투표자, I want each open 투표 in the home list to show its remaining time, so that I can spot 투표 that are about to end.
17. As a 투표자, I want open 투표 listed first, the soonest 마감 시각 at the top, so that urgent 투표 get my attention.
18. As a 투표자, I want 마감 투표 listed after the open ones, most recently 마감 first, so that recent outcomes are easy to find.
19. As a 투표자, I want each 마감 투표 in the list marked 마감, so that I don't open it expecting to vote.

### 투표자: 마감 시각이 지날 때

20. As a 투표자, I want the vote form to disappear when the 마감 시각 passes while I have the page open, so that I don't waste a submission.
21. As a 투표자, I want to see the 마감 notice and the 결과 once the 마감 시각 passes, so that I learn the outcome right away.
22. As a 투표자, I want a 표 I submit after the 마감 시각 to be rejected even if my page still showed the form, so that the deadline is fair to everyone.
23. As a 투표자, I want a rejected late 표 to leave me on the 투표 page showing 마감 and the 결과, so that I understand what happened.
24. As a 투표자, I want a 투표 to count as 마감 the moment its 마감 시각 passes, without the 운영자 doing anything, so that the deadline is real.

### 결과

25. As a 투표자 who didn't vote, I want to see the 결과 of a 마감 투표, so that the whole club knows the outcome.
26. As a 투표자, I want to still see 결과 of an open 투표 only after casting my 표, so that early 결과 don't sway my choice.
27. As an 운영자, I want to see 결과 of any 투표 at any time, as before, so that I can monitor 투표.
28. As a 투표자, I want the 선택지 with the most 표 highlighted in the 결과, so that I see the winner at a glance.
29. As a 투표자, I want all 선택지 tied for the most 표 highlighted, so that a tie is shown honestly.
30. As a 투표자, I want no 선택지 highlighted when there are no 표 yet, so that nothing looks like a winner by default.
31. As a 투표자, I want the winner marked with text (e.g. "1위") and not only with colour, so that it's clear for everyone, including colour-blind users.
32. As a 투표자, I want 선택지 in the 결과 kept in the order the 운영자 entered them, so that I can find my own 선택지 where I saw it.
33. As a 투표자, I want each 선택지's 표 count and percentage and the total 표 still shown, so that the numbers stay visible.

### 만든 사람 표시

34. As the app's maker (이혜리), I want "만든 사람: 이혜리" shown at the bottom of every page, so that everyone knows who made the app.
35. As a 투표자, I want the credit to stay out of the way of the 투표 content, so that it doesn't distract from voting.

### 기존 데이터

36. As an 운영자, I want 투표 that existed before this change to get a 마감 시각 too, so that they also end on their own.
37. As an 운영자, I want existing open 투표 to get a 마감 시각 7 days after the change is deployed, so that people still have time to vote in them.
38. As an 운영자, I want existing 마감 투표 to stay 마감 with their 결과 intact, so that nothing changes for finished 투표.

### 무결성

39. As a site owner, I want the database clock to decide whether a 투표 is 마감, so that a wrong browser clock can't reopen or close a 투표.
40. As a site owner, I want the server to re-check the 마감 시각 range on submit, so that a crafted request can't create a 투표 without a valid 마감 시각.

## Implementation Decisions

- **Glossary changes (already in CONTEXT.md):**
  - **마감** is now a state: a 투표 is 마감 when the 운영자 closed it **or** its 마감 시각 has passed. There is one state, not an automatic and a manual kind.
  - **마감 시각** is a new term.
  - **결과** of a 마감 투표 are public.
- **Schema:**
  - Add `polls.deadline timestamptz NOT NULL`. Keep `polls.closed_at` for manual 마감.
  - A 투표 is 마감 when `closed_at IS NOT NULL OR deadline <= now()`. This is evaluated in SQL with the database clock, in every read and in the vote insert. There is no background job; nothing flips a flag at the deadline.
  - The effective 마감 time (for ordering) is `LEAST(closed_at, deadline)` (`closed_at` may be null).
- **Migration (idempotent, run with the existing schema command; must also be run once against the production database):**
  1. Add `deadline` as nullable.
  2. Backfill open 투표 with `now() + 7 days`. Backfill already-마감 투표 with their `closed_at`.
  3. Set `NOT NULL`.
- **투표 domain module:**
  - `createPoll` takes the 마감 시각.
  - `Poll` and `PollSummary` expose `deadline` and a `closed` flag computed in SQL as above.
  - `castVote` inserts only when the 투표 isn't 마감 by that definition.
  - `listPolls` orders open 투표 by `deadline` ascending, then 마감 투표 by effective 마감 time descending.
- **Validation (create action):**
  - The form submits a local date-time without an offset. The server interprets it as Asia/Seoul.
  - The 마감 시각 is required and must be at least the minimum lead time from now and at most 30 days from now.
  - The minimum lead time defaults to 5 minutes and comes from an environment variable (`DEADLINE_MIN_LEAD_SECONDS`) so the E2E server can shorten it. It is not meant to be set in production.
  - Errors echo back all typed values (question, options, deadline), like existing errors.
- **Form:** a date-time input with minute precision, prefilled with now + 24 hours (KST).
- **Time display:**
  - All times are shown in Asia/Seoul, formatted like "9월 30일 (화) 18:00 마감".
  - Remaining time uses the two largest units: "N일 N시간 남음", "N시간 N분 남음", "N분 남음", and "1분 미만 남음" below a minute.
- **Countdown (client component):**
  - The server passes the deadline. The component re-renders the remaining time every minute.
  - Shortly after the deadline (about +1s), it asks the router to refresh the server-rendered page. The page then shows 마감 and the now-public 결과.
  - The server stays the only authority: a late 표 is rejected by SQL, and the re-rendered page shows 마감 and 결과.
- **결과 visibility:** visible when the 투표자 has voted, **or** the viewer is the 운영자, **or** the 투표 is 마감.
- **결과 bars:**
  - Keep the entered order.
  - Highlight every 선택지 whose 표 count equals the maximum, when the maximum is > 0.
  - Highlight with both an accent style and a visible "1위" label.
- **Home list:** open 투표 show remaining time; 마감 투표 show the 마감 badge. Ordering as above.
- **운영 화면:** each row shows the 마감 시각 (or 마감). The 마감 button is shown only for open 투표.
- **Credit:**
  - A footer in the root layout shows "만든 사람: 이혜리" on every page.
  - It is plain, low-emphasis text below the main content.
- **Unchanged:** the "마감된 투표입니다." notice text and the rules for casting a 표 and for the one-표-per-투표자 limit.

## Testing Decisions

- **Seam:** the single existing seam, browser end-to-end with Playwright against `next dev`, using `.env.local`. No new seams. No test touches the database directly.
- **Time control:**
  - The E2E web server is started with `DEADLINE_MIN_LEAD_SECONDS` set low, so tests can create a 투표 through the normal form whose 마감 시각 is the next minute boundary.
  - Tests then wait in real time for it to pass. The form has minute precision, so these waits are up to about two minutes.
  - Deadline-expiry tests are marked slow, get a longer timeout, and run in parallel with the rest.
- **What makes a good test:** acts only as a user (fill the form, open URLs, wait, click) and asserts only on visible output. It never reads DB rows or internals. Expected values come from the spec (e.g. a known tie produces two "1위" labels), not recomputed like the code does.
- **Scenarios (at least):**
  - Creating without a valid 마감 시각:
    - Too soon or more than 30 days away shows an error and keeps the typed values. (Use the production-default lead in a separate check, or assert the 30-day upper bound, which the env var doesn't affect.)
  - A new 투표 shows its 마감 시각 and a remaining-time text on the 투표 page and in the home list.
  - Home list order: an open 투표 with a sooner 마감 시각 appears above one with a later 마감 시각, and above 마감 투표.
  - Page left open across the 마감 시각: the form disappears on its own, and the 마감 notice and 결과 appear without a manual reload.
  - A 투표자 who never voted opens a 마감 투표 and sees 결과. The same 투표자 on an open 투표 still sees no 결과 before voting.
  - A stale form submitted after the 마감 시각 adds no 표 and shows 마감 and 결과.
  - 운영자 manual 마감 before the 마감 시각 still works, and the 마감 button disappears afterwards.
  - Winner highlight:
    - A clear winner has exactly one "1위".
    - A tie has one "1위" per tied 선택지.
    - A 투표 with 0 표 has none.
  - The footer "만든 사람: 이혜리" is visible on the home page, a 투표 page, the login page and the 운영 화면.
- **Existing tests:**
  - Update the tests that relied on "결과 hidden from non-voters after 마감" (now public) and on list ordering.
  - Update the create-poll helper to fill the 마감 시각 (default prefill is fine for most tests).
- **Prior art:** the existing e2e suite (per-test unique 질문, a new browser context per 투표자, operator login helper, deliberate-bug checks to prove tests can fail).

## Out of Scope

- Changing or extending a 마감 시각 after creation; reopening a 마감 투표.
- Reminders or notifications before the 마감 시각 (email, push, KakaoTalk).
- Pie, donut or vertical charts; realtime updating of 표 counts; sorting 결과 by 표 count.
- Per-viewer time zones (everything is KST).
- Scheduled start times (a 투표 opens as soon as it's created).
- Making the credit text configurable or linking it anywhere.

## Further Notes

- **Assumed without explicit confirmation:** these answers were not given in the grilling session, so the spec follows the recommended options. Revisit them if the user disagrees.
  - Q9: date-time picker defaulting to +24h.
  - Q10: 5 minutes to 30 days.
  - Q11: backfill open 투표 with +7 days.
  - Q12: keep the entered order and highlight 1위, including ties.
  - Q13: live countdown that hides the form at the deadline.
  - Q14: open 투표 first by soonest 마감 시각.
- **Existing data:** the only existing 투표 at the time of writing is '안녕' (open, 1 표). It will get a 마감 시각 7 days after deployment.
- **Deployment:** production (Vercel) shares the Neon database used locally. The migration must be run once (`npm run db:migrate`) before or right after deploying, or production reads will fail on the missing column.
- **Earlier decision reversed:** 결과 of 마감 투표 become public. This replaces the earlier decision (ticket 03, "마감된 투표에서 표를 던지지 않은 투표자는 결과 없이 마감 안내만 본다") and its E2E test.
