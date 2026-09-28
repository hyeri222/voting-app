import { notFound } from "next/navigation";
import { voteAction } from "@/app/actions";
import { isOperator } from "@/lib/auth";
import { formatDeadline } from "@/lib/deadline";
import { getPoll, getVotedOptionId, parseId, type Poll } from "@/lib/polls";
import { getVoterId } from "@/lib/voter";
import { Countdown } from "./countdown";

export default async function PollPage({ params }: PageProps<"/polls/[id]">) {
  const id = parseId((await params).id);
  const poll = id ? await getPoll(id) : null;
  if (!poll) notFound();

  const [operatorLoggedIn, voterId] = await Promise.all([isOperator(), getVoterId()]);
  const votedOptionId = voterId ? await getVotedOptionId(poll.id, voterId) : null;
  const canVote = !poll.closed && votedOptionId === null;
  // While open, results are shown only after voting so they don't sway the vote; once 마감 they're
  // public. Operators always see them.
  const canSeeResults = poll.closed || votedOptionId !== null || operatorLoggedIn;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">{poll.question}</h1>
        {poll.closed && (
          <span className="shrink-0 rounded bg-zinc-200 px-2 py-1 text-sm dark:bg-zinc-800">마감</span>
        )}
      </div>
      {!poll.closed && (
        <p className="-mt-4 text-sm text-zinc-500">
          {formatDeadline(poll.deadline)} · <Countdown msLeft={poll.msLeft} />
        </p>
      )}

      {canVote && (
        <form action={voteAction} className="flex flex-col gap-2">
          <input type="hidden" name="pollId" value={poll.id} />
          {poll.options.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 has-checked:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:has-checked:border-zinc-100"
            >
              <input type="radio" name="optionId" value={option.id} required />
              {option.label}
            </label>
          ))}
          <button className="mt-2 rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
            투표하기
          </button>
          <p className="text-sm text-zinc-500">한 번 투표하면 바꿀 수 없습니다. 결과는 투표 후에 볼 수 있습니다.</p>
        </form>
      )}

      {poll.closed && <p className="text-zinc-500">마감된 투표입니다.</p>}
      {canSeeResults && <Results poll={poll} votedOptionId={votedOptionId} />}
    </div>
  );
}

function Results({ poll, votedOptionId }: { poll: Poll; votedOptionId: number | null }) {
  const total = poll.options.reduce((sum, o) => sum + o.votes, 0);
  // Every 선택지 tied for the most 표 is a winner; with no 표 there is none.
  const topVotes = Math.max(...poll.options.map((o) => o.votes));

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">결과 · 총 {total}표</h2>
      <ul className="flex flex-col gap-4">
        {poll.options.map((option) => {
          const percent = total === 0 ? 0 : Math.round((option.votes / total) * 100);
          const mine = option.id === votedOptionId;
          const winner = topVotes > 0 && option.votes === topVotes;
          return (
            <li key={option.id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className={mine ? "font-semibold" : undefined}>
                  {option.label}
                  {mine && " (내 선택)"}
                  {winner && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      1위
                    </span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums text-zinc-500">
                  {option.votes}표 · {percent}%
                </span>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900">
                <div
                  role="meter"
                  aria-label={option.label}
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className={`h-full rounded-md ${winner ? "bg-amber-400 dark:bg-amber-500" : "bg-zinc-400 dark:bg-zinc-600"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
