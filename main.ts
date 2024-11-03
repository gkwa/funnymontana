-- main.ts --
import { parseUrl, fetchArticle, processContent, verifyAbsoluteUrls } from "./src"
import { chromium } from "playwright"
import config from "./playwright.config"

async function main() {
  const url = process.argv[2]
  if (!url) {
    console.error("Please provide a URL as an argument")
    process.exit(1)
  }

  const browser = await chromium.launch(config.use)
  const context = await browser.newContext(config.use)
  const page = await context.newPage()

  try {
    console.log(`Fetching URL: ${url}`)
    const { baseUrl, path: articlePath } = parseUrl(url)
    console.log(`Base URL: ${baseUrl}, Article Path: ${articlePath}`)

    const content = await fetchArticle(page, url)
    console.log(`Content fetched, length: ${content.length} characters`)

    const { originalPath, processedPath } = await processContent(content, baseUrl, articlePath)
    console.log(`Content processed`)

    verifyAbsoluteUrls(processedPath)
    console.log(`Original content saved to: ${originalPath}`)
    console.log(`Processed content saved to: ${processedPath}`)
  } catch (error) {
    console.error("An error occurred:", error)
  } finally {
    await browser.close()
  }
}

if (require.main === module) {
  main()
}
