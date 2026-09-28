import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

// TEST_DATABASE_URL must point at a separate Neon branch; e2e/global-setup.ts truncates it.
if (existsSync(".env.test.local")) process.loadEnvFile(".env.test.local");
// Fail here: the web server starts before globalSetup and would otherwise hang until timeout.
if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL is not set. Put a Neon test branch URL in .env.test.local.");
}

const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  // Tests share one database, but each creates its own 투표, so they can run in parallel.
  fullyParallel: true,
  // More workers just queue up behind the single dev server and Neon round-trips.
  workers: 4,
  retries: 0,
  // next dev compiles each route on first hit, which can exceed the 5s default under parallel load.
  expect: { timeout: 15_000 },
  // Each test logs in and round-trips to Neon several times; multi-voter tests run ~25s.
  timeout: 90_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Uses the installed Chrome instead of downloading Playwright's Chromium.
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    // Next doesn't override variables already in process.env, so this wins over .env.local.
    env: { DATABASE_URL: process.env.TEST_DATABASE_URL },
  },
});
