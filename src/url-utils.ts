import fs from "fs"
import path from "path"
import { readCachedFile } from "./file-utils"

export function parseUrl(url: string): { baseUrl: string; path: string } {
  const parsedUrl = new URL(url)
  return {
    baseUrl: `${parsedUrl.protocol}//${parsedUrl.host}`,
    path: parsedUrl.pathname,
  }
}

export function verifyAbsoluteUrls(filePath: string): void {
  const savedContent = readCachedFile(filePath) || ""
  const absoluteUrlRegex = /(href|src|srcset)="(https?:\/\/[^"]+)"/g
  const matches = savedContent.match(absoluteUrlRegex) || []

  if (matches.length === 0) {
    console.warn("No absolute URLs found in the processed content.")
  }

  matches.forEach((match: string) => {
    if (!match.match(/(href|src|srcset)="https?:\/\//)) {
      console.warn(`Potentially invalid absolute URL found: ${match}`)
    }
  })
}
