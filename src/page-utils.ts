import type { Page } from "playwright"

export async function waitForDynamicContent(page: Page, targetUrl: string, timeoutMs = 5000) {
  await page.goto(targetUrl, { waitUntil: "domcontentloaded" })
  await Promise.race([
    page.waitForLoadState("networkidle"),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ])
}
