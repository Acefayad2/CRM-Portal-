/**
 * POST /api/decks/[id]/upload
 * Accepts either:
 * - multipart/form-data file upload (`file`)
 * - shared presentation link (`externalUrl`, optional `label`)
 */
import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/supabase"
import { resolvePresentationActor } from "@/lib/presentation-actor"
import { serializePresentationSourceMetadata } from "@/lib/presentation-source"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_EXTENSIONS = new Set(["pdf", "ppt", "pptx", "pps", "ppsx", "key", "odp", "doc", "docx"])

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const actor = await resolvePresentationActor()
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: deck } = await actor.client
      .from("slide_decks")
      .select("id, owner_user_id")
      .eq("id", deckId)
      .single()

    if (!deck || deck.owner_user_id !== actor.userId) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const externalUrl = formData.get("externalUrl")
    const labelValue = formData.get("label")

    if (typeof externalUrl === "string" && externalUrl.trim()) {
      const parsedUrl = parsePresentationUrl(externalUrl)
      if (!parsedUrl) {
        return NextResponse.json({ error: "Enter a valid presentation link" }, { status: 400 })
      }

      await actor.client.from("slides").delete().eq("deck_id", deckId)

      const { data: inserted, error: insertError } = await actor.client
        .from("slides")
        .insert({
          deck_id: deckId,
          slide_index: 0,
          storage_path: parsedUrl,
          speaker_notes: serializePresentationSourceMetadata({
            kind: "link",
            label: typeof labelValue === "string" ? labelValue.trim() || "Shared presentation link" : "Shared presentation link",
          }),
        })
        .select("id, slide_index, storage_path, speaker_notes")
        .single()

      if (insertError) {
        console.error("[api/decks/[id]/upload] link insert error:", insertError)
        return NextResponse.json({ error: "Failed to save link" }, { status: 500 })
      }

      return NextResponse.json({
        ok: true,
        storage_path: parsedUrl,
        numPages: 1,
        slides: inserted ? [inserted] : [],
      })
    }

    const file = formData.get("file") as File | null
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file or link provided" }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 })
    }

    const extension = getFileExtension(file.name)
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { error: "Supported files: PDF, PowerPoint, Keynote, OpenDocument, and Word" },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const safeFileName = sanitizeFileName(file.name, extension)
    const storagePath = `${actor.userId}/${deckId}/${safeFileName}`

    const { error: uploadError } = await actor.client.storage
      .from("slide-decks")
      .upload(storagePath, buffer, {
        contentType: file.type || guessContentType(extension),
        upsert: true,
      })

    if (uploadError) {
      console.error("[api/decks/[id]/upload] storage error:", uploadError)
      return NextResponse.json({ error: uploadError.message || "Upload failed" }, { status: 500 })
    }

    await actor.client.from("slides").delete().eq("deck_id", deckId)

    if (extension === "pdf") {
      let numPages = await getPdfPageCount(buffer)
      if (numPages <= 0) numPages = 1

      const slides = Array.from({ length: numPages }, (_, i) => ({
        deck_id: deckId,
        slide_index: i,
        storage_path: storagePath,
        speaker_notes: null,
      }))

      const { error: insertError } = await actor.client.from("slides").insert(slides)
      if (insertError) {
        console.error("[api/decks/[id]/upload] slides insert error:", insertError)
        return NextResponse.json({ error: "Failed to create slide records" }, { status: 500 })
      }

      const { data: slideList } = await actor.client
        .from("slides")
        .select("id, slide_index, storage_path, speaker_notes")
        .eq("deck_id", deckId)
        .order("slide_index", { ascending: true })

      return NextResponse.json({
        ok: true,
        storage_path: storagePath,
        numPages,
        slides: slideList ?? [],
      })
    }

    const { data: inserted, error: insertError } = await actor.client
      .from("slides")
      .insert({
        deck_id: deckId,
        slide_index: 0,
        storage_path: storagePath,
        speaker_notes: serializePresentationSourceMetadata({
          kind: "office",
          mimeType: file.type || guessContentType(extension),
          fileName: file.name,
          label: file.name,
        }),
      })
      .select("id, slide_index, storage_path, speaker_notes")
      .single()

    if (insertError) {
      console.error("[api/decks/[id]/upload] office insert error:", insertError)
      return NextResponse.json({ error: "Failed to create deck source" }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      storage_path: storagePath,
      numPages: 1,
      slides: inserted ? [inserted] : [],
    })
  } catch (err) {
    console.error("[api/decks/[id]/upload] Error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

function getFileExtension(fileName: string): string {
  const cleaned = fileName.toLowerCase().trim()
  const last = cleaned.split(".").pop()
  return last ?? ""
}

function sanitizeFileName(fileName: string, extension: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, "").toLowerCase()
  const slug = baseName
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "deck"
  return `${slug}.${extension}`
}

function parsePresentationUrl(value: string): string | null {
  try {
    const url = new URL(value.trim())
    return url.toString()
  } catch {
    return null
  }
}

function guessContentType(extension: string): string {
  switch (extension) {
    case "pdf":
      return "application/pdf"
    case "ppt":
      return "application/vnd.ms-powerpoint"
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    case "pps":
      return "application/vnd.ms-powerpoint"
    case "ppsx":
      return "application/vnd.openxmlformats-officedocument.presentationml.slideshow"
    case "key":
      return "application/vnd.apple.keynote"
    case "odp":
      return "application/vnd.oasis.opendocument.presentation"
    case "doc":
      return "application/msword"
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    default:
      return "application/octet-stream"
  }
}

async function getPdfPageCount(buffer: ArrayBuffer): Promise<number> {
  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    return pdf.numPages
  } catch (_e) {
    return 0
  }
}
