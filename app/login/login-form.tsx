"use client";

import { useActionState } from "react";
import { logInAction, type FormState } from "@/app/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(logInAction, {} as FormState);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        name="password"
        type="password"
        placeholder="비밀번호"
        autoComplete="current-password"
        required
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "로그인 중…" : "로그인"}
      </button>
    </form>
  );
}
