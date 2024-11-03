import { test, expect } from '@playwright/test'
import { parseUrl, fetchArticle, processContent, verifyAbsoluteUrls } from '../src'
import { chromium } from 'playwright'
import config from '../playwright.config'
import fs from 'fs'
import path from 'path'

test('single URL test', async ({ }, testInfo) => {
  const url = testInfo.project.name
  if (!url.startsWith('http')) {
    test.skip()
    return
  }

  const browser = await chromium.launch(config.use)
  const context = await browser.newContext(config.use)
  const page = await context.newPage()

  try {
    const { baseUrl, path: articlePath } = parseUrl(url)
    const content = await fetchArticle(page, url)
    expect(content.length).toBeGreaterThan(0)

    const { originalPath, processedPath } = await processContent(content, baseUrl, articlePath)
    expect(fs.existsSync(originalPath)).toBeTruthy()
    expect(fs.existsSync(processedPath)).toBeTruthy()

    const originalContent = fs.readFileSync(originalPath, 'utf-8')
    const processedContent = fs.readFileSync(processedPath, 'utf-8')
    expect(originalContent.length).toBeGreaterThan(0)
    expect(processedContent.length).toBeGreaterThan(0)

  } finally {
    await browser.close()
  }
})

