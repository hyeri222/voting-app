"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logIn, logOut, requireOperator } from "@/lib/auth";
import * as polls from "@/lib/polls";
import { getOrCreateVoterId } from "@/lib/voter";

export type FormState = { error?: string };

export async function logInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!(await logIn(username, password))) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }
  redirect("/operator");
}

export async function logOutAction() {
  await logOut();
  redirect("/");
}

// Echoes the submitted values back, since React resets the form after the action runs.
export type PollFormState = FormState & { values?: { question: string; options: string[] } };

export async function createPollAction(_prev: PollFormState, formData: FormData): Promise<PollFormState> {
  const operator = await requireOperator();
  const rawQuestion = String(formData.get("question") ?? "");
  const rawOptions = formData.getAll("option").map(String);
  const question = rawQuestion.trim();
  const options = rawOptions.map((o) => o.trim()).filter(Boolean);
  const fail = (error: string) => ({ error, values: { question: rawQuestion, options: rawOptions } });

  if (!question) return fail("질문을 입력하세요.");
  if (options.length < polls.MIN_OPTIONS || options.length > polls.MAX_OPTIONS) {
    return fail(`선택지는 ${polls.MIN_OPTIONS}~${polls.MAX_OPTIONS}개여야 합니다.`);
  }
  if (new Set(options).size !== options.length) return fail("선택지가 중복되었습니다.");

  const id = await polls.createPoll(question, options, operator.id);
  revalidatePath("/");
  redirect(`/polls/${id}`);
}

export async function closePollAction(formData: FormData) {
  await requireOperator();
  const id = polls.parseId(formData.get("pollId"));
  if (!id) return;
  await polls.closePoll(id);
  revalidatePath("/", "layout");
}

export async function deletePollAction(formData: FormData) {
  await requireOperator();
  const id = polls.parseId(formData.get("pollId"));
  if (!id) return;
  await polls.deletePoll(id);
  revalidatePath("/", "layout");
}

export async function voteAction(formData: FormData) {
  const pollId = polls.parseId(formData.get("pollId"));
  const optionId = polls.parseId(formData.get("optionId"));
  if (!pollId || !optionId) return;
  const voterId = await getOrCreateVoterId();
  // A rejected vote (closed poll, repeat vote) just falls through to the refreshed page.
  await polls.castVote(pollId, optionId, voterId);
  revalidatePath(`/polls/${pollId}`);
  revalidatePath("/");
}
