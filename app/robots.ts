import type { MetadataRoute } from "next"
import { SITE_ORIGIN } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  const base = SITE_ORIGIN.replace(/\/$/, "")
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal/", "/api/", "/admin/", "/test-sms"],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
