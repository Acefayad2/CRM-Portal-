/**
 * Configure pdf.js for browser use in Next.js. Call once before using getDocument.
 * Sets worker to CDN so Next.js doesn't need to bundle the worker.
 */
const PDFJS_VERSION = "5.4.624"
const WORKER_SRC = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`

let configured = false
export async function ensurePdfJsConfig() {
  if (configured || typeof window === "undefined") return
  try {
    const pdfjsLib = await import("pdfjs-dist")
    const g = (pdfjsLib as unknown as { GlobalWorkerOptions?: { workerSrc?: string } }).GlobalWorkerOptions
    if (g && !g.workerSrc) g.workerSrc = WORKER_SRC
  } finally {
    configured = true
  }
}
