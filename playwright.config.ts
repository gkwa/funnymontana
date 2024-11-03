import { defineConfig, devices } from "@playwright/test"
import fs from "fs"

const urls = fs
  .readFileSync("tests/urls.txt", "utf-8")
  .split("\n")
  .filter(Boolean)
  .map((url) => url.trim())

const config = defineConfig({
  testDir: "./tests",
  use: {
    headless: process.env.HEADLESS !== "false",
    viewport: { width: 1280, height: 720 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Add a project for each URL for individual testing
    ...urls.map((url) => ({
      name: url,
      use: { ...devices["Desktop Chrome"] },
    })),
  ],
})

export default config
