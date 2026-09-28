// 마감 시각 helpers shared by server pages and the client countdown. Everything is Korea time.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const MAX_DEADLINE_DAYS = 30;
const DEFAULT_DEADLINE_HOURS = 24;

/** A datetime-local value ("YYYY-MM-DDTHH:mm") showing `date` in Korea time. */
function toKstInputValue(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 16);
}

/** The prefilled 마감 시각 for a new 투표: 24 hours from now, as a datetime-local value. */
export function defaultDeadlineInputValue(): string {
  return toKstInputValue(new Date(Date.now() + DEFAULT_DEADLINE_HOURS * HOUR));
}

/** Reads a datetime-local value as Korea time; null if it isn't one. */
export function parseKstInputValue(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Why a new 마감 시각 isn't allowed, or null if it is: at least `minLeadSeconds` ahead, within 30 days. */
export function checkDeadline(deadline: Date, minLeadSeconds: number): string | null {
  const msAhead = deadline.getTime() - Date.now();
  if (msAhead < minLeadSeconds * 1000) {
    const lead = minLeadSeconds < 60 ? `${minLeadSeconds}초` : `${Math.round(minLeadSeconds / 60)}분`;
    return `마감 시각은 지금부터 ${lead} 뒤보다 늦어야 합니다.`;
  }
  if (msAhead > MAX_DEADLINE_DAYS * DAY) return `마감 시각은 ${MAX_DEADLINE_DAYS}일 이내여야 합니다.`;
  return null;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** e.g. "9월 30일 (화) 18:00 마감". */
export function formatDeadline(deadline: Date): string {
  const kst = new Date(deadline.getTime() + KST_OFFSET_MS);
  const hh = String(kst.getUTCHours()).padStart(2, "0");
  const mm = String(kst.getUTCMinutes()).padStart(2, "0");
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일 (${WEEKDAYS[kst.getUTCDay()]}) ${hh}:${mm} 마감`;
}

/** Time left in its two largest units, e.g. "2일 3시간 남음", "45분 남음". */
export function formatRemaining(ms: number): string {
  if (ms < MINUTE) return "1분 미만 남음";
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  const minutes = Math.floor((ms % HOUR) / MINUTE);
  if (days > 0) return `${days}일 ${hours}시간 남음`;
  if (hours > 0) return `${hours}시간 ${minutes}분 남음`;
  return `${minutes}분 남음`;
}
