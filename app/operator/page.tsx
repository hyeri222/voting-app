import Link from "next/link";
import { closePollAction } from "@/app/actions";
import { requireOperator } from "@/lib/auth";
import { defaultDeadlineInputValue, formatDeadline } from "@/lib/deadline";
import { listPolls } from "@/lib/polls";
import { DeletePollButton } from "./delete-poll-button";
import { NewPollForm } from "./new-poll-form";

export default async function OperatorPage() {
  await requireOperator();
  const polls = await listPolls();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">새 투표</h1>
        <NewPollForm defaultDeadline={defaultDeadlineInputValue()} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">투표 관리</h2>
        {polls.length === 0 ? (
          <p className="text-zinc-500">아직 투표가 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {polls.map((poll) => (
              <li
                key={poll.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <Link href={`/polls/${poll.id}`} className="font-medium hover:underline">
                    {poll.question}
                  </Link>
                  {!poll.closed && <span className="text-sm text-zinc-500">{formatDeadline(poll.deadline)}</span>}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <span className="text-zinc-500">{poll.voteCount}표</span>
                  {poll.closed ? (
                    <span className="rounded bg-zinc-200 px-1.5 py-0.5 dark:bg-zinc-800">마감</span>
                  ) : (
                    <form action={closePollAction}>
                      <input type="hidden" name="pollId" value={poll.id} />
                      <button className="hover:underline">마감</button>
                    </form>
                  )}
                  <DeletePollButton pollId={poll.id} question={poll.question} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
