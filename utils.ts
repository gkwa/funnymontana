import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

const scratchDir = path.join("tmp");

export function parseUrl(url: string): { baseUrl: string; path: string } {
  const parsedUrl = new URL(url);
  return {
    baseUrl: `${parsedUrl.protocol}//${parsedUrl.host}`,
    path: parsedUrl.pathname,
  };
}

export async function fetchArticle(page: any, url: string): Promise<string> {
  await page.goto(url, { timeout: 120000, waitUntil: "domcontentloaded" });
  return await page.content();
}

export async function processContent(
  content: string,
  baseUrl: string,
  articlePath: string,
): Promise<{ originalPath: string; processedPath: string }> {
  const originalPath = saveFile(content, articlePath, "-original");

  const $ = cheerio.load(content);

  $("*").each((_, element) => {
    const attributesToUpdate = ["href", "src", "srcset"];

    attributesToUpdate.forEach((attr) => {
      const value = $(element).attr(attr);
      if (value) {
        if (attr === "srcset") {
          const srcsetParts = value.split(",").map((part) => {
            const [url, descriptor] = part.trim().split(/\s+/);
            const absoluteUrl = new URL(url, baseUrl).href;
            return descriptor ? `${absoluteUrl} ${descriptor}` : absoluteUrl;
          });
          $(element).attr(attr, srcsetParts.join(", "));
        } else {
          $(element).attr(attr, new URL(value, baseUrl).href);
        }
      }
    });
  });

  const processedContent = $.html();
  const processedPath = saveFile(processedContent, articlePath, "-processed");

  return { originalPath, processedPath };
}

export function verifyAbsoluteUrls(filePath: string): void {
  const savedContent = fs.readFileSync(filePath, "utf-8");
  const absoluteUrlRegex = /(href|src|srcset)="(https?:\/\/[^"]+)"/g;
  const matches = savedContent.match(absoluteUrlRegex) || [];

  if (matches.length === 0) {
    throw new Error("No absolute URLs found in the processed content.");
  }

  matches.forEach((match) => {
    if (!match.match(/(href|src|srcset)="https?:\/\//)) {
      throw new Error(`Invalid absolute URL found: ${match}`);
    }
  });
}

function saveFile(
  content: string,
  articlePath: string,
  suffix: string,
): string {
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const parsedPath = path.parse(articlePath);
  let fileName = parsedPath.name + suffix + (parsedPath.ext || ".html");
  const filePath = path.join(scratchDir, fileName);
  fs.writeFileSync(filePath, content);

  return filePath;
}
