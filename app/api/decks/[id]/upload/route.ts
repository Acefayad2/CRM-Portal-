/**
 * POST /api/decks/[id]/upload - upload PDF for deck (multipart/form-data, field: file)
 * Creates one slide per PDF page; storage_path = {userId}/{deckId}/deck.pdf (same path, slide_index = page)
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPE = "application/pdf"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: deck } = await supabase
      .from("slide_decks")
      .select("id, owner_user_id")
      .eq("id", deckId)
      .single()

    if (!deck || deck.owner_user_id !== user.id) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 })
    }
    if (file.type !== ALLOWED_TYPE) {
      return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const storagePath = `${user.id}/${deckId}/deck.pdf`

    const { error: uploadError } = await supabase.storage
      .from("slide-decks")
      .upload(storagePath, buffer, {
        contentType: ALLOWED_TYPE,
        upsert: true,
      })

    if (uploadError) {
      console.error("[api/decks/[id]/upload] storage error:", uploadError)
      return NextResponse.json({ error: uploadError.message || "Upload failed" }, { status: 500 })
    }

    // Get page count from PDF when possible; otherwise create single slide (client will use PDF numPages)
    let numPages = await getPdfPageCount(buffer)
    if (numPages <= 0) numPages = 1

    // Delete existing slides for this deck
    await supabase.from("slides").delete().eq("deck_id", deckId)

    // Insert one slide per page (storage_path same; client uses slide_index as page number)
    const slides = Array.from({ length: numPages }, (_, i) => ({
      deck_id: deckId,
      slide_index: i,
      storage_path: storagePath,
      speaker_notes: null,
    }))
    const { error: insertError } = await supabase.from("slides").insert(slides)
    if (insertError) {
      console.error("[api/decks/[id]/upload] slides insert error:", insertError)
      return NextResponse.json({ error: "Failed to create slide records" }, { status: 500 })
    }

    const { data: slideList } = await supabase
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
  } catch (err) {
    console.error("[api/decks/[id]/upload] Error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
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
