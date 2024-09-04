import fs from "fs";

const instructionsStart = "<instructions>";
const instructionsBody = `
Convert the html to markdown.

Please make a few transformations along the way:

1. Put the title of the page on a separate line at the top 
of the file.  Please don't add this title as a header.  Instead
just add it without formatting on a line all by itself.

1. Put a markdown link to the original article at the top
of the page using standard markdown format [title](url). 

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
