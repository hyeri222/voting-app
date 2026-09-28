import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { secureCookie } from "./cookies";

// There is a single 운영자, who logs in with ADMIN_PASSWORD. The session is a cookie holding
// its expiry time signed with SESSION_SECRET, so nothing is stored in the database.
// Changing SESSION_SECRET logs the 운영자 out everywhere.
const SESSION_COOKIE = "operator_session";
const SESSION_DAYS = 7;

function requireEnv(name: "ADMIN_PASSWORD" | "SESSION_SECRET"): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", requireEnv("SESSION_SECRET")).update(payload).digest("hex");
}

// Hash both sides first so timingSafeEqual gets equal-length inputs.
function safeEqual(a: string, b: string) {
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export async function logIn(password: string): Promise<boolean> {
  if (!safeEqual(password, requireEnv("ADMIN_PASSWORD"))) return false;

  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const token = `${expiresAt}.${sign(String(expiresAt))}`;
  (await cookies()).set(SESSION_COOKIE, token, { ...secureCookie, expires: new Date(expiresAt) });
  return true;
}

export async function logOut() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isOperator(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature || !safeEqual(signature, sign(expiresAt))) return false;
  return Number(expiresAt) > Date.now();
}

export async function requireOperator(): Promise<void> {
  if (!(await isOperator())) redirect("/login");
}
