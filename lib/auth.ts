import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "./db";
import { verifyPassword } from "./password.mjs";

const SESSION_COOKIE = "operator_session";
const SESSION_DAYS = 7;

export type Operator = { id: number; username: string };

// Only the hash is stored, so a leaked sessions table can't be replayed.
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function logIn(username: string, password: string): Promise<boolean> {
  const rows = await sql`SELECT id, password_hash FROM operators WHERE username = ${username}`;
  const row = rows[0];
  if (!row || !(await verifyPassword(password, row.password_hash))) return false;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO operator_sessions (token_hash, operator_id, expires_at)
    VALUES (${hashToken(token)}, ${row.id}, ${expiresAt})
  `;
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });
  return true;
}

export async function logOut() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await sql`DELETE FROM operator_sessions WHERE token_hash = ${hashToken(token)}`;
  }
  store.delete(SESSION_COOKIE);
}

export async function getOperator(): Promise<Operator | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await sql`
    SELECT o.id, o.username
    FROM operator_sessions s JOIN operators o ON o.id = s.operator_id
    WHERE s.token_hash = ${hashToken(token)} AND s.expires_at > now()
  `;
  return (rows[0] as Operator | undefined) ?? null;
}

export async function requireOperator(): Promise<Operator> {
  const operator = await getOperator();
  if (!operator) redirect("/login");
  return operator;
}
