export type PresentationSourceKind = "pdf" | "embed" | "link"

export type PresentationSource = {
  kind: PresentationSourceKind
  url: string | null
  embedUrl: string | null
  label: string
  canNavigate: boolean
  fileName?: string | null
}

type SourceMetadata = {
  __pantheonSource: true
  kind: "office" | "link"
  mimeType?: string | null
  fileName?: string | null
  label?: string | null
}

const OFFICE_EXTENSIONS = new Set(["ppt", "pptx", "pps", "ppsx", "doc", "docx", "xls", "xlsx"])
const GOOGLE_VIEWER_EXTENSIONS = new Set(["key", "odp", "odt", "ods"])
const PDF_EXTENSIONS = new Set(["pdf"])

export function serializePresentationSourceMetadata(metadata: Omit<SourceMetadata, "__pantheonSource">): string {
  return JSON.stringify({
    __pantheonSource: true,
    ...metadata,
  } satisfies SourceMetadata)
}

export function parsePresentationSourceMetadata(value: string | null | undefined): SourceMetadata | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as SourceMetadata
    if (parsed && parsed.__pantheonSource === true && (parsed.kind === "office" || parsed.kind === "link")) {
      return parsed
    }
  } catch {}
  return null
}

export function getRenderableSlideNotes(value: string | null | undefined): string | null {
  return parsePresentationSourceMetadata(value) ? null : value ?? null
}

function getFileExtension(fileNameOrUrl: string | null | undefined): string {
  if (!fileNameOrUrl) return ""
  const cleaned = fileNameOrUrl.split("?")[0].split("#")[0]
  const last = cleaned.split(".").pop()
  return last ? last.toLowerCase() : ""
}

export function inferPresentationLinkLabel(url: string): string {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    if (host.includes("docs.google.com")) {
      if (parsed.pathname.includes("/presentation/")) return "Google Slides"
      if (parsed.pathname.includes("/document/")) return "Google Doc"
      if (parsed.pathname.includes("/spreadsheets/")) return "Google Sheet"
    }
    if (host.includes("drive.google.com")) return "Google Drive"
    if (host.includes("canva.com")) return "Canva"
    if (host.includes("figma.com")) return "Figma"
    if (host.includes("icloud.com")) return "iCloud / Keynote"
    if (host.includes("powerpoint.live.com") || host.includes("office.com")) return "Microsoft Office"
  } catch {}
  return "Shared presentation link"
}

function toEmbedUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl)
    const host = url.hostname.toLowerCase()

    if (host.includes("docs.google.com")) {
      if (url.pathname.includes("/presentation/d/")) {
        const id = url.pathname.match(/\/presentation\/d\/([^/]+)/)?.[1]
        if (id) return `${url.origin}/presentation/d/${id}/embed?rm=minimal`
      }
      if (url.pathname.includes("/document/d/") || url.pathname.includes("/spreadsheets/d/")) {
        const type = url.pathname.includes("/document/d/") ? "document" : "spreadsheets"
        const id = url.pathname.match(new RegExp(`/${type}/d/([^/]+)`))?.[1]
        if (id) return `${url.origin}/${type}/d/${id}/preview`
      }
    }

    if (host.includes("drive.google.com")) {
      const match = url.pathname.match(/\/file\/d\/([^/]+)/)
      const id = match?.[1] ?? url.searchParams.get("id")
      if (id) return `https://drive.google.com/file/d/${id}/preview`
    }
  } catch {}

  return rawUrl
}

export function buildPresentationSource(params: {
  signedUrl?: string | null
  storagePathOrUrl?: string | null
  speakerNotes?: string | null
}): PresentationSource | null {
  const metadata = parsePresentationSourceMetadata(params.speakerNotes)
  const rawUrl = params.signedUrl ?? params.storagePathOrUrl ?? null

  if (metadata?.kind === "link") {
    const url = params.storagePathOrUrl ?? null
    if (!url) return null
    const label = metadata.label?.trim() || inferPresentationLinkLabel(url)
    const extension = getFileExtension(url)
    if (PDF_EXTENSIONS.has(extension)) {
      return {
        kind: "pdf",
        url,
        embedUrl: null,
        label,
        canNavigate: true,
      }
    }
    return {
      kind: "embed",
      url,
      embedUrl: toEmbedUrl(url),
      label,
      canNavigate: false,
    }
  }

  if (metadata?.kind === "office" && rawUrl) {
    const extension = getFileExtension(metadata.fileName ?? rawUrl)
    const label = metadata.fileName?.trim() || metadata.label?.trim() || "Uploaded presentation"

    if (extension === "pdf" || metadata.mimeType === "application/pdf") {
      return {
        kind: "pdf",
        url: rawUrl,
        embedUrl: null,
        label,
        canNavigate: true,
        fileName: metadata.fileName ?? null,
      }
    }

    if (OFFICE_EXTENSIONS.has(extension)) {
      return {
        kind: "embed",
        url: rawUrl,
        embedUrl: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(rawUrl)}`,
        label,
        canNavigate: false,
        fileName: metadata.fileName ?? null,
      }
    }

    if (GOOGLE_VIEWER_EXTENSIONS.has(extension)) {
      return {
        kind: "embed",
        url: rawUrl,
        embedUrl: `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(rawUrl)}`,
        label,
        canNavigate: false,
        fileName: metadata.fileName ?? null,
      }
    }

    return {
      kind: "link",
      url: rawUrl,
      embedUrl: null,
      label,
      canNavigate: false,
      fileName: metadata.fileName ?? null,
    }
  }

  if (!rawUrl) return null

  const extension = getFileExtension(rawUrl)
  if (PDF_EXTENSIONS.has(extension)) {
    return {
      kind: "pdf",
      url: rawUrl,
      embedUrl: null,
      label: "PDF deck",
      canNavigate: true,
    }
  }

  return {
    kind: "link",
    url: rawUrl,
    embedUrl: null,
    label: "Presentation source",
    canNavigate: false,
  }
}
