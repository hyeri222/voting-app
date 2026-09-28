import "server-only";
import { db } from "./db";

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 10;

/** How far ahead a new 마감 시각 must be. 5 minutes; the E2E server lowers it via env. */
export function minDeadlineLeadSeconds(): number {
  const raw = process.env.DEADLINE_MIN_LEAD_SECONDS;
  const fromEnv = raw ? Number(raw) : NaN;
  return Number.isFinite(fromEnv) && fromEnv >= 0 ? fromEnv : 5 * 60;
}

/** Parses a 투표 or 선택지 id from a URL segment or form field; null if it isn't a positive integer. */
export function parseId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// A 투표 is 마감 once the 운영자 closes it or its 마감 시각 passes, judged by the database clock
// in every query below, so nothing has to run at the deadline.

export type PollSummary = {
  id: number;
  question: string;
  closed: boolean;
  deadline: Date;
  /** Time until the 마감 시각 by the database clock; negative once it has passed. */
  msLeft: number;
  voteCount: number;
};

export type Poll = {
  id: number;
  question: string;
  closed: boolean;
  deadline: Date;
  /** Time until the 마감 시각 by the database clock; negative once it has passed. */
  msLeft: number;
  options: { id: number; label: string; votes: number }[];
};

export async function listPolls(): Promise<PollSummary[]> {
  const rows = await db()`
    SELECT p.id, p.question, (p.closed_at IS NOT NULL OR p.deadline <= now()) AS closed, p.deadline,
           (EXTRACT(EPOCH FROM p.deadline - now()) * 1000)::float8 AS ms_left,
           (SELECT count(*) FROM votes v WHERE v.poll_id = p.id)::int AS vote_count
    FROM polls p
    -- Open 투표 first, soonest 마감 시각 on top; then 마감 투표, most recently 마감 first.
    ORDER BY (p.closed_at IS NOT NULL OR p.deadline <= now()),
             CASE WHEN p.closed_at IS NULL AND p.deadline > now() THEN p.deadline END ASC,
             LEAST(p.closed_at, p.deadline) DESC
  `;
  return rows.map((r) => ({
    id: r.id,
    question: r.question,
    closed: r.closed,
    deadline: new Date(r.deadline),
    msLeft: r.ms_left,
    voteCount: r.vote_count,
  }));
}

export async function getPoll(id: number): Promise<Poll | null> {
  const [polls, options] = await db().transaction([
    db()`SELECT id, question, (closed_at IS NOT NULL OR deadline <= now()) AS closed, deadline,
      (EXTRACT(EPOCH FROM deadline - now()) * 1000)::float8 AS ms_left FROM polls WHERE id = ${id}`,
    db()`
      SELECT o.id, o.label, count(v.id)::int AS votes
      FROM options o LEFT JOIN votes v ON v.option_id = o.id
      WHERE o.poll_id = ${id}
      GROUP BY o.id
      ORDER BY o.position
    `,
  ]);
  const poll = polls[0];
  if (!poll) return null;
  return {
    id: poll.id,
    question: poll.question,
    closed: poll.closed,
    deadline: new Date(poll.deadline),
    msLeft: poll.ms_left,
    options: options.map((o) => ({ id: o.id, label: o.label, votes: o.votes })),
  };
}

export async function getVotedOptionId(pollId: number, voterId: string): Promise<number | null> {
  const rows = await db()`SELECT option_id FROM votes WHERE poll_id = ${pollId} AND voter_id = ${voterId}`;
  return rows[0]?.option_id ?? null;
}

export async function createPoll(question: string, options: string[], deadline: Date): Promise<number> {
  const rows = await db()`
    WITH p AS (
      INSERT INTO polls (question, deadline) VALUES (${question}, ${deadline}) RETURNING id
    ), o AS (
      INSERT INTO options (poll_id, label, position)
      SELECT p.id, t.label, t.ord FROM p, unnest(${options}::text[]) WITH ORDINALITY AS t(label, ord)
    )
    SELECT id FROM p
  `;
  return rows[0].id;
}

export async function closePoll(id: number) {
  // Only open 투표: one whose 마감 시각 has passed is already 마감.
  await db()`UPDATE polls SET closed_at = now() WHERE id = ${id} AND closed_at IS NULL AND deadline > now()`;
}

export async function deletePoll(id: number) {
  await db()`DELETE FROM polls WHERE id = ${id}`;
}

/** Returns false if the poll is closed, the option doesn't belong to it, or this voter already voted. */
export async function castVote(pollId: number, optionId: number, voterId: string): Promise<boolean> {
  const rows = await db()`
    INSERT INTO votes (poll_id, option_id, voter_id)
    SELECT o.poll_id, o.id, ${voterId}
    FROM options o JOIN polls p ON p.id = o.poll_id
    WHERE o.id = ${optionId} AND o.poll_id = ${pollId} AND p.closed_at IS NULL AND p.deadline > now()
    ON CONFLICT (poll_id, voter_id) DO NOTHING
    RETURNING id
  `;
  return rows.length > 0;
}
