import * as cheerio from "cheerio"
import path from "path"
import { scratchDir, generateMd5, writeFile } from "./file-utils"

export async function processContent(
  content: string,
  baseUrl: string,
  articlePath: string,
): Promise<{ originalPath: string; processedPath: string }> {
  const md5sum = generateMd5(baseUrl + articlePath)
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
  writeFile(processedPath, processedContent)

  return { originalPath, processedPath }
}

