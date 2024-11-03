import fs from "fs"
import path from "path"
import crypto from "crypto"

export const scratchDir = path.join("tmp")

export function generateMd5(input: string): string {
  return crypto.createHash("md5").update(input).digest("hex")
}

export function readCachedFile(filePath: string): string | null {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8")
  }
  return null
}

export function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
}
