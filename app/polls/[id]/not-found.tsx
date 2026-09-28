import Link from "next/link";

export default function PollNotFound() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">없는 투표입니다</h1>
      <p className="text-zinc-500">삭제되었거나 주소가 잘못되었습니다.</p>
      <Link href="/" className="hover:underline">
        ← 투표 목록으로
      </Link>
    </div>
  );
}
