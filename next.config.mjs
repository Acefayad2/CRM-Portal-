import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid tracing from a parent folder when another lockfile exists (e.g. ~/Documents/Playground).
  outputFileTracingRoot: __dirname,
  async redirects() {
    return [
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
