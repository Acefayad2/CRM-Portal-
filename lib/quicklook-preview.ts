import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { execFile } from "child_process"
import { promisify } from "util"
import { PDFDocument } from "pdf-lib"

const execFileAsync = promisify(execFile)

const QUICKLOOK_EXTENSIONS = new Set(["ppt", "pptx", "pps", "ppsx", "key", "odp", "doc", "docx"])

function getFileExtension(fileName: string): string {
  const cleaned = fileName.toLowerCase().trim()
  const last = cleaned.split(".").pop()
  return last ?? ""
}

function sanitizeBaseName(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, "").toLowerCase()
  return (
    baseName
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "presentation"
  )
}

function extractAttachmentOrder(previewHtml: string): string[] {
  const orderedFiles: string[] = []
  const matches = previewHtml.matchAll(/(?:src|href)=["']([^"']+\.pdf)["']/gi)
  for (const match of matches) {
    const fileName = match[1]?.trim()
    if (fileName && !orderedFiles.includes(fileName)) {
      orderedFiles.push(fileName)
    }
  }
  return orderedFiles
}

async function mergeSlidePdfs(previewDir: string, orderedFiles: string[]): Promise<Uint8Array | null> {
  if (orderedFiles.length === 0) return null

  const mergedPdf = await PDFDocument.create()

  for (const fileName of orderedFiles) {
    const filePath = path.join(previewDir, fileName)
    const bytes = await fs.readFile(filePath)
    const sourcePdf = await PDFDocument.load(bytes)
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  if (mergedPdf.getPageCount() === 0) return null
  return mergedPdf.save()
}

export function canGenerateQuickLookPdf(fileName: string): boolean {
  return process.platform === "darwin" && QUICKLOOK_EXTENSIONS.has(getFileExtension(fileName))
}

export async function generateQuickLookPdf(file: { name: string; buffer: ArrayBuffer }): Promise<{
  pdfBytes: Uint8Array
  pageCount: number
  outputFileName: string
} | null> {
  if (!canGenerateQuickLookPdf(file.name)) {
    return null
  }

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "pantheon-preview-"))

  try {
    const inputPath = path.join(tempRoot, file.name)
    const outputDir = path.join(tempRoot, "preview")

    await fs.mkdir(outputDir, { recursive: true })
    await fs.writeFile(inputPath, Buffer.from(file.buffer))

    await execFileAsync("/usr/bin/qlmanage", ["-p", "-o", outputDir, inputPath])

    const entries = await fs.readdir(outputDir, { withFileTypes: true })
    const previewEntry = entries.find((entry) => entry.isDirectory() && entry.name.endsWith(".qlpreview"))
    if (!previewEntry) {
      return null
    }

    const previewDir = path.join(outputDir, previewEntry.name)
    const previewHtmlPath = path.join(previewDir, "Preview.html")
    const previewHtml = await fs.readFile(previewHtmlPath, "utf8")
    const orderedFiles = extractAttachmentOrder(previewHtml)
    const pdfBytes = await mergeSlidePdfs(previewDir, orderedFiles)
    if (!pdfBytes || orderedFiles.length === 0) {
      return null
    }

    return {
      pdfBytes,
      pageCount: orderedFiles.length,
      outputFileName: `${sanitizeBaseName(file.name)}-converted.pdf`,
    }
  } catch (error) {
    console.error("[quicklook-preview] Conversion failed:", error)
    return null
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true }).catch(() => undefined)
  }
}
