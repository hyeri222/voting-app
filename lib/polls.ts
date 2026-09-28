import "server-only";
import { db } from "./db";

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 10;

/** Parses a 투표 or 선택지 id from a URL segment or form field; null if it isn't a positive integer. */
export function parseId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export type PollSummary = {
  id: number;
  question: string;
  closed: boolean;
  createdAt: Date;
  voteCount: number;
};

export type Poll = {
  id: number;
  question: string;
  closed: boolean;
  options: { id: number; label: string; votes: number }[];
};

export async function listPolls(): Promise<PollSummary[]> {
  const rows = await db()`
    SELECT p.id, p.question, p.closed_at IS NOT NULL AS closed, p.created_at,
           (SELECT count(*) FROM votes v WHERE v.poll_id = p.id)::int AS vote_count
    FROM polls p
    ORDER BY p.created_at DESC
  `;
  return rows.map((r) => ({
    id: r.id,
    question: r.question,
    closed: r.closed,
    createdAt: new Date(r.created_at),
    voteCount: r.vote_count,
  }));
}

export async function getPoll(id: number): Promise<Poll | null> {
  const [polls, options] = await db().transaction([
    db()`SELECT id, question, closed_at IS NOT NULL AS closed FROM polls WHERE id = ${id}`,
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
    options: options.map((o) => ({ id: o.id, label: o.label, votes: o.votes })),
  };
}

export async function getVotedOptionId(pollId: number, voterId: string): Promise<number | null> {
  const rows = await db()`SELECT option_id FROM votes WHERE poll_id = ${pollId} AND voter_id = ${voterId}`;
  return rows[0]?.option_id ?? null;
}

export async function createPoll(question: string, options: string[]): Promise<number> {
  const rows = await db()`
    WITH p AS (
      INSERT INTO polls (question) VALUES (${question}) RETURNING id
    ), o AS (
      INSERT INTO options (poll_id, label, position)
      SELECT p.id, t.label, t.ord FROM p, unnest(${options}::text[]) WITH ORDINALITY AS t(label, ord)
    )
    SELECT id FROM p
  `;
  return rows[0].id;
}

export async function closePoll(id: number) {
  await db()`UPDATE polls SET closed_at = now() WHERE id = ${id} AND closed_at IS NULL`;
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
    WHERE o.id = ${optionId} AND o.poll_id = ${pollId} AND p.closed_at IS NULL
    ON CONFLICT (poll_id, voter_id) DO NOTHING
    RETURNING id
  `;
  return rows.length > 0;
}
