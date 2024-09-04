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

const instructionsStart = "<instructions>";
const instructionsBody = `
Convert the html to markdown.

Please make a few transformations along the way:

1. Put the title of the page on a separate line at the top 
of the file.  Please don't add this title as a header.  Instead
just add it without formatting on a line all by itself.

1. Put a markdown link to the original article at the top
of the page using standard markdown format [title](url). 

1. When you respond with your results, please don't say things like this
"Here is the converted markdown..." since I already know that you're giving 
markdown because thats the question I asked originally. When you do say that then
I have to go edit the markdown to delete it.

1. In the process of converting, change formatting such that each
sentence is a new paragraph.  This helps comprehension.

1. When formatting code blocks please label the code block with the
name of the language.

1. Make sure to keep all links to external images or to github gists 
or code blocks.

So for example, if you find image links like this:
<img src="https://miro.medium.com/v2/resize:fit:577/1*wlWUTYxYuNl5v7DX6KnmYQ.jpeg" />

You should include them into the result like this:
![](https://miro.medium.com/v2/resize:fit:577/1*wlWUTYxYuNl5v7DX6KnmYQ.jpeg)

1. Relative links should be converted to absolute links. 
You can do this because I've provided the original url here:
`;
const instructionsEnd = "</instructions>";

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
