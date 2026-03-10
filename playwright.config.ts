import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  // Give each test 30 s; assertions time out after 5 s
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Run tests sequentially (avoids race conditions with a single dev server)
  fullyParallel: false,
  workers: 1,

  // Fail the suite on test.only in CI
  forbidOnly: !!process.env.CI,

  // One retry in CI to tolerate flaky animation/load timing
  retries: process.env.CI ? 1 : 0,

  // GitHub-friendly reporter in CI; rich HTML report locally
  reporter: process.env.CI ? "github" : "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Start the CRA dev server before running the suite.
  // reuseExistingServer lets you keep `npm start` running locally.
  webServer: {
    command: "npm --prefix client start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      BROWSER: "none", // prevent CRA from opening a browser tab
      PORT: "3000",
    },
  },
});
