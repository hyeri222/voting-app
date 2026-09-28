"use client";

import { deletePollAction } from "@/app/actions";

export function DeletePollButton({ pollId, question }: { pollId: number; question: string }) {
  return (
    <form
      action={deletePollAction}
      onSubmit={(e) => {
        if (!confirm(`"${question}" 투표를 삭제할까요? 표도 모두 사라지며 되돌릴 수 없습니다.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="pollId" value={pollId} />
      <button className="text-red-600 hover:underline">삭제</button>
    </form>
  );
}
