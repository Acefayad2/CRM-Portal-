import type { MetadataRoute } from "next"
import { SITE_ORIGIN } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_ORIGIN.replace(/\/$/, "")
  const last = new Date()
  const paths = [
    "",
    "/pricing",
    "/contact",
    "/support",
    "/privacy-policy",
    "/terms",
    "/sms-policy",
    "/policy/twilio",
    "/signup",
    "/login",
  ]
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: last,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }))
}
