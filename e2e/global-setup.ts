import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { neon } from "@neondatabase/serverless";
import { OPERATOR } from "./helpers";

export default async function globalSetup() {
  // playwright.config.ts already guarantees it's set.
  const testUrl = process.env.TEST_DATABASE_URL!;
  const devUrl = existsSync(".env.local") ? parseEnv(readFileSync(".env.local", "utf8")).DATABASE_URL : undefined;
  if (devUrl && sameDatabase(devUrl, testUrl) && process.env.E2E_ALLOW_SHARED_DB !== "1") {
    throw new Error(
      "TEST_DATABASE_URL points at the same database as DATABASE_URL. Refusing to wipe it " +
        "(set E2E_ALLOW_SHARED_DB=1 in .env.test.local to allow).",
    );
  }

  const env = { ...process.env, DATABASE_URL: testUrl };
  execFileSync("node", ["scripts/migrate.mjs"], { env, stdio: "inherit" });
  const sql = neon(testUrl);
  await sql`TRUNCATE polls, operator_sessions RESTART IDENTITY CASCADE`;
  execFileSync("node", ["scripts/create-operator.mjs", OPERATOR.username, OPERATOR.password], {
    env,
    stdio: "inherit",
  });
}

// Neon's pooled and direct hostnames differ only by "-pooler"; treat them as one database.
function sameDatabase(a: string, b: string) {
  const key = (url: string) => {
    const u = new URL(url);
    return `${u.hostname.replace("-pooler", "")}${u.pathname}`;
  };
  return key(a) === key(b);
}
