import { readCachedFile, writeFile } from "./file-utils"

const instructionsStart = ""
const instructionsBody = `
`
const instructionsEnd = ""

export function generateTemplate(url: string, markdownFile: string, outputFile: string): void {
  const markdownContent = readCachedFile(markdownFile) || ""
  const template = `${instructionsStart}
${instructionsBody}
${url}
${instructionsEnd}

${markdownContent}`
  writeFile(outputFile, template)
}
