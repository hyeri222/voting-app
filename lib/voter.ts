import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

// One browser = one voter. Clearing cookies or a private window gets a new voter id.
const VOTER_COOKIE = "voter_id";

export async function getVoterId(): Promise<string | null> {
  return (await cookies()).get(VOTER_COOKIE)?.value ?? null;
}

/** Only callable from a Server Action, since it may set a cookie. */
export async function getOrCreateVoterId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VOTER_COOKIE)?.value;
  if (existing) return existing;

  const voterId = randomUUID();
  store.set(VOTER_COOKIE, voterId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return voterId;
}
