import { defineConfig } from "@playwright/test";

// Tests run against the same .env.local the app uses (DATABASE_URL, ADMIN_PASSWORD,
// SESSION_SECRET). They only add 투표 with unique 질문 text and never wipe data.
process.loadEnvFile(".env.local");
for (const name of ["DATABASE_URL", "ADMIN_PASSWORD", "SESSION_SECRET"]) {
  // Fail here: the web server starts before globalSetup and would otherwise hang until timeout.
  if (!process.env[name]) throw new Error(`${name} is not set in .env.local`);
}

const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  // Each test creates its own 투표, so tests can run in parallel against one database.
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
    // Lets deadline tests create 투표 that close within seconds instead of the 5-minute minimum.
    env: { DEADLINE_MIN_LEAD_SECONDS: "5" },
  },
});
