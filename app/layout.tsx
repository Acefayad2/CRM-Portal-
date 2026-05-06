import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pantheonportal.com"),
  title: {
    default: "Pantheon CRM Portal | Sales Team Workspace",
    template: "%s | Pantheon CRM Portal",
  },
  description:
    "Protect today. Grow tomorrow. Pantheon CRM Portal helps sales teams manage pipeline, meetings, calendars, scripts, and team execution in one secure workspace.",
  keywords: [
    "sales CRM",
    "sales team portal",
    "pipeline management",
    "meeting workflow",
    "sales scripts",
    "team collaboration",
    "Pantheon CRM",
  ],
  openGraph: {
    title: "Pantheon CRM Portal | Sales Team Workspace",
    description:
      "Manage pipeline, meetings, calendars, scripts, and team execution in one secure workspace.",
    url: "/",
    siteName: "Pantheon CRM Portal",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pantheon CRM Portal | Sales Team Workspace",
    description:
      "Manage pipeline, meetings, calendars, scripts, and team execution in one secure workspace.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
