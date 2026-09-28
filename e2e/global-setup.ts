import { execFileSync } from "node:child_process";

// Makes sure the schema exists; playwright.config.ts has already loaded .env.local.
export default function globalSetup() {
  execFileSync("node", ["scripts/migrate.mjs"], { stdio: "inherit" });
}
