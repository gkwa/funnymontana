import type { Page } from "playwright"
import path from "path"
import { scratchDir, generateMd5, readCachedFile, writeFile } from "./file-utils"
import { waitForDynamicContent } from "./page-utils"

export async function fetchArticle(page: Page, url: string): Promise<string> {
  const md5sum = generateMd5(url)
  const cachedFilePath = path.join(scratchDir, `${md5sum}-original.html`)

  const cachedContent = readCachedFile(cachedFilePath)
  if (cachedContent) {
    return cachedContent
  }

  await waitForDynamicContent(page, url, 5000)
  const content = await page.content()

  writeFile(cachedFilePath, content)
  return content
}
