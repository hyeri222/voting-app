"use client";

import { useActionState, useState } from "react";
import { createPollAction, type PollFormState } from "@/app/actions";

// Mirrors MIN_OPTIONS / MAX_OPTIONS in lib/polls.ts, which is server-only; the action re-checks.
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950";

export function NewPollForm() {
  const [state, action, pending] = useActionState(createPollAction, {} as PollFormState);
  // Stable keys so removing a middle field doesn't shift typed values around.
  const [optionKeys, setOptionKeys] = useState([0, 1]);
  const [nextKey, setNextKey] = useState(2);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        name="question"
        placeholder="질문"
        required
        defaultValue={state.values?.question}
        className={inputClass}
      />
      {optionKeys.map((key, i) => (
        <div key={key} className="flex gap-2">
          <input
            name="option"
            placeholder={`선택지 ${i + 1}`}
            // Not required: blank 선택지 fields are ignored; the action enforces 2~10 filled ones.
            defaultValue={state.values?.options[i]}
            className={inputClass}
          />
          {optionKeys.length > MIN_OPTIONS && (
            <button
              type="button"
              onClick={() => setOptionKeys(optionKeys.filter((k) => k !== key))}
              className="shrink-0 px-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              aria-label={`선택지 ${i + 1} 삭제`}
            >
              ✕
            </button>
          )}
        </div>
      ))}
      {optionKeys.length < MAX_OPTIONS && (
        <button
          type="button"
          onClick={() => {
            setOptionKeys([...optionKeys, nextKey]);
            setNextKey(nextKey + 1);
          }}
          className="self-start text-sm text-zinc-500 hover:underline"
        >
          + 선택지 추가
        </button>
      )}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "만드는 중…" : "투표 만들기"}
      </button>
    </form>
  );
}
