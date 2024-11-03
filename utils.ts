import * as cheerio from "cheerio"
import fs from "fs"
import path from "path"
import crypto from "crypto"
import type { Page } from "playwright"

const scratchDir = path.join("tmp")

async function waitForDynamicContent(page: Page, targetUrl: string, timeoutMs = 5000) {
  await page.goto(targetUrl, { waitUntil: "domcontentloaded" })
  await Promise.race([
    page.waitForLoadState("networkidle"),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ])
}

export function parseUrl(url: string): { baseUrl: string; path: string } {
  const parsedUrl = new URL(url)
  return {
    baseUrl: `${parsedUrl.protocol}//${parsedUrl.host}`,
    path: parsedUrl.pathname,
  }
}

export async function fetchArticle(page: Page, url: string): Promise<string> {
  const md5sum = crypto.createHash("md5").update(url).digest("hex")
  const cachedFilePath = path.join(scratchDir, `${md5sum}-original.html`)

  if (fs.existsSync(cachedFilePath)) {
    return fs.readFileSync(cachedFilePath, "utf-8")
  }

  await waitForDynamicContent(page, url, 5000)
  const content = await page.content()

  fs.writeFileSync(cachedFilePath, content)
  return content
}

export async function processContent(
  content: string,
  baseUrl: string,
  articlePath: string,
): Promise<{ originalPath: string; processedPath: string }> {
  const md5sum = crypto
    .createHash("md5")
    .update(baseUrl + articlePath)
    .digest("hex")
  const originalPath = path.join(scratchDir, `${md5sum}-original.html`)
  const processedPath = path.join(scratchDir, `${md5sum}-processed.html`)

  const $ = cheerio.load(content)

  $("*").each((_, element) => {
    const attributesToUpdate = ["href", "src", "srcset"]

    attributesToUpdate.forEach((attr) => {
      const value = $(element).attr(attr)
      if (value) {
        try {
          if (attr === "srcset") {
            const srcsetParts = value.split(",").map((part) => {
              const [url, descriptor] = part.trim().split(/\s+/)
              try {
                const absoluteUrl = new URL(url, baseUrl).href
                return descriptor ? `${absoluteUrl} ${descriptor}` : absoluteUrl
              } catch (error) {
                console.warn(`Invalid URL in srcset: ${url}`)
                return part.trim()
              }
            })
            $(element).attr(attr, srcsetParts.join(", "))
          } else {
            if (value.startsWith("http://") || value.startsWith("https://")) {
              $(element).attr(attr, value)
            } else {
              $(element).attr(attr, new URL(value, baseUrl).href)
            }
          }
        } catch (error) {
          console.warn(`Skipping invalid URL: ${value} in attribute ${attr}`)
          $(element).attr(attr, value)
        }
      }
    })
  })

  const processedContent = $.html()
  fs.writeFileSync(processedPath, processedContent)

  return { originalPath, processedPath }
}

export function verifyAbsoluteUrls(filePath: string): void {
  const savedContent = fs.readFileSync(filePath, "utf-8")
  const absoluteUrlRegex = /(href|src|srcset)="(https?:\/\/[^"]+)"/g
  const matches = savedContent.match(absoluteUrlRegex) || []

  if (matches.length === 0) {
    console.warn("No absolute URLs found in the processed content.")
  }

  matches.forEach((match) => {
    if (!match.match(/(href|src|srcset)="https?:\/\//)) {
      console.warn(`Potentially invalid absolute URL found: ${match}`)
    }
  })
}

const instructionsStart = ""
const instructionsBody = `
`
const instructionsEnd = ""

export function generateTemplate(url: string, markdownFile: string, outputFile: string): void {
  const markdownContent = fs.readFileSync(markdownFile, "utf-8")
  const template = `${instructionsStart}
${instructionsBody}
${url}
${instructionsEnd}

${markdownContent}`
  fs.writeFileSync(outputFile, template)
}
