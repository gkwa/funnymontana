import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const scratchDir = path.join("tmp");

export function parseUrl(url: string): { baseUrl: string; path: string } {
  const parsedUrl = new URL(url);
  return {
    baseUrl: `${parsedUrl.protocol}//${parsedUrl.host}`,
    path: parsedUrl.pathname,
  };
}

export async function fetchArticle(page: any, url: string): Promise<string> {
  const md5sum = crypto.createHash("md5").update(url).digest("hex");
  const cachedFilePath = path.join(scratchDir, `${md5sum}-original.html`);

  if (fs.existsSync(cachedFilePath)) {
    return fs.readFileSync(cachedFilePath, "utf-8");
  }

  await page.goto(url, { timeout: 120000, waitUntil: "domcontentloaded" });
  const content = await page.content();

  fs.writeFileSync(cachedFilePath, content);
  return content;
}

export async function processContent(
  content: string,
  baseUrl: string,
  articlePath: string,
): Promise<{ originalPath: string; processedPath: string }> {
  const md5sum = crypto
    .createHash("md5")
    .update(baseUrl + articlePath)
    .digest("hex");
  const originalPath = path.join(scratchDir, `${md5sum}-original.html`);
  const processedPath = path.join(scratchDir, `${md5sum}-processed.html`);

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
  fs.writeFileSync(processedPath, processedContent);

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

const instructionsStart = "";
const instructionsBody = `
`;
const instructionsEnd = "";

export function generateTemplate(
  url: string,
  markdownFile: string,
  outputFile: string,
): void {
  const markdownContent = fs.readFileSync(markdownFile, "utf-8");
  const template = `${instructionsStart}
${instructionsBody}
${url}
${instructionsEnd}

${markdownContent}`;
  fs.writeFileSync(outputFile, template);
}
