# 투표 앱

Status: ready-for-agent

## Problem Statement

여러 사람의 의견을 빠르게 모으고 싶은데, 설문 도구는 가입·설정이 번거롭고 결과를 공유하기도 불편하다. 운영자는 질문 하나와 선택지 몇 개만 올려 사람들의 선택을 모으고 싶고, 투표자는 로그인 없이 링크 하나로 들어와 선택지 하나를 고르고 결과를 보고 싶다. 운영자가 아닌 사람이 투표를 만들거나 지우는 일, 한 사람이 같은 투표에 여러 번 표를 던지는 일은 막아야 한다.

## Solution

Vercel에 배포되고 Neon DB에 데이터를 저장하는 간단한 웹앱.

- 운영자는 아이디와 비밀번호로 로그인해 투표를 만들고, 마감하고, 삭제한다. 운영자는 여러 명일 수 있고, 계정은 명령어로 만든다(가입 화면 없음).
- 투표자는 로그인하지 않는다. 브라우저 하나를 투표자 한 명으로 보고, 쿠키로 식별한다.
- 투표자는 홈의 투표 목록이나 공유 링크로 투표에 들어와 선택지 하나를 골라 표를 던진다. 표는 투표 하나에 한 표이며 바꾸거나 취소할 수 없다.
- 결과는 그 투표에 표를 던진 투표자와 운영자만 볼 수 있다. 결과는 페이지를 열 때 갱신된다.

## User Stories

### 운영자: 로그인

1. As an 운영자, I want to log in with my 아이디 and 비밀번호, so that only I and other 운영자 can manage 투표.
2. As an 운영자, I want to see a clear error when my 아이디 or 비밀번호 is wrong, so that I know to retry without learning which of the two was wrong.
3. As an 운영자, I want my login to persist for a week, so that I don't have to log in every time I open the app.
4. As an 운영자, I want to log out, so that nobody else using this browser can manage 투표.
5. As an 운영자, I want to be sent to the 운영 화면 automatically when I open the login page while already logged in, so that I don't log in twice.
6. As an 운영자, I want my 아이디 and username shown in the header while logged in, so that I know which 운영자 I'm acting as.
7. As a site owner, I want 운영자 accounts to be created only through a command, so that nobody can sign themselves up as an 운영자.
8. As a site owner, I want to reset an 운영자's 비밀번호 by re-running the same command, so that a forgotten 비밀번호 isn't a dead end.
9. As a site owner, I want 운영자 비밀번호 stored only as salted hashes, so that a leaked database doesn't expose them.

### 운영자: 투표 만들기

10. As an 운영자, I want to create a 투표 with a 질문 and 2~10 선택지, so that 투표자 can choose between them.
11. As an 운영자, I want to add and remove 선택지 input fields while creating a 투표, so that I can make 투표 with any number of 선택지 from 2 to 10.
12. As an 운영자, I want to be unable to remove fields below 2 선택지 or add above 10, so that I can't build an invalid 투표.
13. As an 운영자, I want an error when the 질문 is empty, so that no 투표 goes up without a 질문.
14. As an 운영자, I want an error when two 선택지 are identical, so that 투표자 aren't confused by duplicates.
15. As an 운영자, I want blank 선택지 fields ignored, so that a stray empty field doesn't become a 선택지.
16. As an 운영자, I want 선택지 shown to 투표자 in the order I entered them, so that the 투표 looks the way I designed it.
17. As an 운영자, I want to land on the new 투표's page right after creating it, so that I can check it and copy its link to share.

### 운영자: 투표 관리

18. As an 운영자, I want a list of all 투표 with each one's 표 count and 마감 status on the 운영 화면, so that I can see everything I manage in one place.
19. As an 운영자, I want to 마감 a 투표, so that it stops accepting 표 while its 결과 remain.
20. As an 운영자, I want a 마감 action that can't be undone, so that 결과 stay final once a 투표 is closed.
21. As an 운영자, I want to delete a 투표, so that mistaken or unwanted 투표 disappear.
22. As an 운영자, I want a confirmation prompt before deleting a 투표, so that I don't delete one by accident.
23. As an 운영자, I want deleting a 투표 to also remove its 선택지 and 표 completely, so that no orphaned data is left behind.
24. As an 운영자, I want to be able to 마감 or delete any 투표, including ones another 운영자 created, so that 운영자 can cover for each other.
25. As an 운영자, I want to see 결과 of any 투표 at any time without casting a 표, so that I can monitor 투표 in progress.
26. As an 운영자, I want to still be able to cast a 표 myself like any 투표자, so that I can take part in my own 투표.

### 투표자: 투표 찾기

27. As a 투표자, I want a list of 투표 on the home page, newest first, so that I can find 투표 without a link.
28. As a 투표자, I want each 투표 in the list to show its 질문, 표 count and whether it's 마감, so that I can decide which to open.
29. As a 투표자, I want to open a 투표 directly from a shared link, so that someone can send me a specific 투표.
30. As a 투표자, I want a clear "없는 투표입니다" page when the link points to a deleted or nonexistent 투표, so that I know it's gone rather than broken.
31. As a 투표자, I want a message instead of an empty list when there are no 투표 yet, so that I know the app is working.

### 투표자: 표 던지기

32. As a 투표자, I want to cast a 표 without signing up or logging in, so that taking part is effortless.
33. As a 투표자, I want to choose exactly one 선택지 per 투표, so that my 표 is unambiguous.
34. As a 투표자, I want the 투표하기 button to require a selection, so that I can't submit an empty 표.
35. As a 투표자, I want to be told before voting that my 표 can't be changed and that 결과 appear after voting, so that I choose carefully.
36. As a 투표자, I want my 표 to be counted only once per 투표 even if I resubmit or refresh, so that 결과 are fair.
37. As a 투표자, I want to see my own 선택지 marked in the 결과, so that I can confirm what I chose.
38. As a 투표자, I want the vote form hidden after I've voted, so that I'm not invited to vote again.
39. As a 투표자, I want to be unable to cast a 표 on a 마감 투표, so that 마감 means what it says.
40. As a 투표자, I want to see that a 투표 is 마감 when I open it, so that I understand why I can't vote.
41. As a 투표자, I want my voting status in one 투표 not to affect other 투표, so that I can vote in each 투표 once.

### 투표자: 결과

42. As a 투표자, I want to see 결과 only after casting my 표, so that earlier 결과 don't sway my choice.
43. As a 투표자, I want 결과 to show each 선택지's 표 count, percentage and a bar, so that I can compare 선택지 at a glance.
44. As a 투표자, I want to see the total number of 표, so that I know how many people have voted.
45. As a 투표자, I want to see updated 결과 when I reopen or refresh the page, so that I can follow the 투표.
46. As a 투표자 who didn't vote before a 투표 was 마감, I want to see that it is 마감 (without 결과), so that the rule "결과 after voting" holds consistently.

### 보안과 무결성

47. As a site owner, I want every 운영자 action (만들기, 마감, 삭제) to verify the 운영자 session on the server, so that crafted requests can't bypass the UI.
48. As a site owner, I want visiting the 운영 화면 while logged out to redirect to the login page, so that 운영자 tools are never shown to 투표자.
49. As a site owner, I want a 표 for a 선택지 that doesn't belong to the 투표 to be rejected, so that crafted requests can't corrupt 결과.
50. As a site owner, I want the one-표 rule enforced by the database, so that concurrent submissions can't create duplicates.
51. As a site owner, I want session and 투표자 cookies to be httpOnly and secure in production, so that scripts can't read or steal them.
52. As a site owner, I want only a hash of each 운영자 session token stored, so that a leaked sessions table can't be replayed.

### 배포

53. As a site owner, I want to deploy on Vercel with only a DATABASE_URL environment variable, so that setup is minimal.
54. As a site owner, I want a single command to apply the database schema, safely re-runnable, so that setting up a new Neon database is trivial.

## Implementation Decisions

- **Stack**: Next.js 16 App Router on Vercel, Neon Postgres via the Neon serverless HTTP driver. Mutations are Server Actions; pages are dynamic Server Components that read the DB on each request (no caching, no realtime).
- **Modules**:
  - **DB access**: a single server-only Neon client configured from `DATABASE_URL`.
  - **Password hashing**: scrypt with a per-password random salt, stored as `salt:hash`. Kept in plain JS so both the app and the operator command share one implementation.
  - **운영자 auth**: `logIn(username, password) → boolean`, `logOut()`, `getOperator() → Operator | null`, `requireOperator() → Operator` (redirects to the login page when there's no session). Sessions are random tokens in an httpOnly cookie; the DB stores only a SHA-256 of the token with a 7-day expiry.
  - **투표자 identity**: `getVoterId() → string | null` for reads; `getOrCreateVoterId()` for Server Actions, which sets a random UUID cookie (1 year) on first 표.
  - **투표 domain**: `listPolls`, `getPoll(id)` (투표 + 선택지 with 표 counts, in order), `getVotedOptionId(pollId, voterId)`, `createPoll(question, options, operatorId)`, `closePoll(id)`, `deletePoll(id)`, `castVote(pollId, optionId, voterId) → boolean`. `MIN_OPTIONS = 2`, `MAX_OPTIONS = 10`.
  - **Server Actions**: log in, log out, create, 마감, delete, cast 표. Every 운영자 action calls `requireOperator()` first. Create validates the 질문 is non-empty and that there are 2~10 distinct, non-blank 선택지.
- **Schema** (Postgres):
  - `operators(id, username UNIQUE, password_hash, created_at)`
  - `operator_sessions(token_hash PK, operator_id → operators ON DELETE CASCADE, expires_at)`
  - `polls(id, question, created_by → operators ON DELETE SET NULL, closed_at NULL = open, created_at)`
  - `options(id, poll_id → polls ON DELETE CASCADE, label, position)`
  - `votes(id, poll_id → polls ON DELETE CASCADE, option_id → options ON DELETE CASCADE, voter_id, created_at, UNIQUE(poll_id, voter_id))`
- **Rules enforced in the database**:
  - One 표 per 투표자 per 투표 comes from the unique constraint (`ON CONFLICT DO NOTHING`).
  - `castVote` inserts only when the 선택지 belongs to the 투표 and the 투표 isn't 마감, all in one statement. A rejected 표 is silent: the page just re-renders in its current state.
  - `createPoll` inserts the 투표 and all its 선택지 in one statement.
- **결과 visibility**: 결과 are shown when the current 투표자 has a 표 in this 투표 or the viewer is a logged-in 운영자. The vote form is shown when the 투표 is open and the current 투표자 hasn't voted. A 마감 투표 shows no 결과 to a 투표자 who never voted.
- **Authorization**: any 운영자 can 마감 or delete any 투표; there is no per-poll ownership check.
- **운영자 provisioning**: a command takes 아이디 and 비밀번호 (min 8 chars) and upserts, so re-running resets the 비밀번호. A second command applies the idempotent schema. Both read `DATABASE_URL` from the local env file.
- **Routes**: home (투표 목록), 투표 page by numeric id (with not-found page), 운영자 로그인, 운영 화면 (create form + management list).

## Testing Decisions

- **Seam**: a single seam, browser end-to-end. Playwright drives the real app (`next dev` or `next start`) against a dedicated Neon test branch, never the production database. There are no unit tests for the internal modules: every rule is observable through the browser, so it is tested there.
- **What makes a good test**: it acts only as a user would (clicking, filling forms, opening URLs) and asserts only on what a user sees (text, visible or hidden controls, URLs, HTTP status). It never inspects DB rows, cookies' contents or module internals. Tests keep passing if the schema or module boundaries change while behavior stays the same.
- **Test data**: each test creates its own 투표 with unique 질문 text and doesn't depend on other tests' data. A 운영자 account for tests is provisioned via the operator command before the suite runs. The schema is applied to the test branch before the run.
- **Separate 투표자**: each fresh Playwright browser context is a new 투표자 (new cookie jar). Use this to test one-표-per-투표자 and multiple-투표자 scenarios.
- **Scenarios to cover** (at least):
  - Login succeeds and fails; logout; the 운영 화면 redirects to login when logged out.
  - Creating a 투표 with valid input lands on its page with 선택지 in the entered order.
  - Validation errors: empty 질문, duplicate 선택지. The add/remove limits at 2 and 10 fields.
  - A 투표자 sees the form and no 결과 → casts a 표 → sees 결과 with their 선택지 marked and no form. After reload, still no form.
  - Two 투표자 contexts voting produce correct counts and percentages.
  - A 운영자 sees 결과 without voting.
  - After 마감: the form disappears for a 투표자 who hasn't voted, with no 결과 and a 마감 notice. A 투표자 who voted still sees 결과. The list shows 마감.
  - Delete with the confirmation accepted removes the 투표 from both lists and its link shows "없는 투표입니다". Dismissing the confirmation keeps it.
  - A crafted POST to a 운영자 action without a session doesn't change anything (as far as can be done from the browser/HTTP level).
- **Prior art**: none. The repo has no tests yet; this suite establishes the pattern.

## Out of Scope

- 투표자 accounts, sign-up or login; stronger duplicate-vote prevention (IP, device fingerprinting). A private window or cleared cookies deliberately counts as a new 투표자.
- Editing a 투표 or its 선택지 after creation; reopening a 마감 투표.
- Multiple-choice, ranked or free-text 선택지; scheduled 마감 / deadlines.
- Realtime or polling 결과 updates.
- Soft delete / restoring deleted 투표.
- 운영자 management UI (creating, listing or removing 운영자 in the app); per-poll ownership permissions.
- Rate limiting, CAPTCHA, analytics, i18n beyond Korean.

## Further Notes

- An initial implementation of everything above already exists in the repo. It passes build, typecheck and lint, and a DB-level smoke test (선택지 ordering, one 표 per 투표자, 마감 and foreign-선택지 rejection, cascade delete) passed against Neon. The remaining work is mainly the E2E suite, which may surface fixes.
- Known rough edge: when creating a 투표 fails validation, the form's typed values are cleared (the default React form reset after an action). Preserving them is a nice-to-have.
- Domain vocabulary is defined in `CONTEXT.md`. Use 투표 / 선택지 / 표 / 마감 / 결과 / 운영자 / 투표자 consistently in UI copy, tests and tickets.
