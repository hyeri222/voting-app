import Link from "next/link";
import { formatRemaining } from "@/lib/deadline";
import { listPolls } from "@/lib/polls";

export default async function Home() {
  const polls = await listPolls();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">투표 목록</h1>
      {polls.length === 0 ? (
        <p className="text-zinc-500">아직 투표가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {polls.map((poll) => (
            <li key={poll.id}>
              <Link
                href={`/polls/${poll.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
              >
                <span className="font-medium">{poll.question}</span>
                <span className="shrink-0 text-sm text-zinc-500">
                  {poll.closed ? (
                    <span className="mr-2 rounded bg-zinc-200 px-1.5 py-0.5 dark:bg-zinc-800">마감</span>
                  ) : (
                    <span className="mr-2">{formatRemaining(poll.msLeft)}</span>
                  )}
                  {poll.voteCount}표
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
