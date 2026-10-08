import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  fullyParallel: false,

  workers: 1,

  forbidOnly: Boolean(process.env.CI),

  retries: process.env.CI ? 1 : 0,

  reporter: "list",

  use: {
		baseURL: "http://127.0.0.1:5173",

    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",

      use: {
        ...devices["Desktop Chrome"],
      }
    }
  ],

  webServer: [
    {
      name: "backend",

      command: "DOTENV_CONFIG_PATH=.env.test NODE_ENV=test npm run dev",

      cwd: "../backend",

      url: "http://127.0.0.1:3000/api/auth/me",

      timeout: 120_000,

      reuseExistingServer: false
    },

    {
      name: "frontend",

      command: "npm run dev -- --host 127.0.0.1",

      cwd: ".",

      url: "http://127.0.0.1:5173",

      timeout: 120_000,

      reuseExistingServer: false
    }
  ]
});