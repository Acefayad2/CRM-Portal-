import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { BUSINESS_POSITIONING, COMPANY_DISPLAY_NAME } from "@/lib/site"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pantheonportal.com"),
  title: {
    default: `${COMPANY_DISPLAY_NAME} | CRM & compliant client messaging`,
    template: `%s | ${COMPANY_DISPLAY_NAME}`,
  },
  description: BUSINESS_POSITIONING,
  keywords: [
    "Pantheon Portal",
    "sales CRM",
    "10DLC",
    "SMS compliance",
    "appointment reminders",
    "client communication",
    "pipeline management",
    "team collaboration",
  ],
  openGraph: {
    title: `${COMPANY_DISPLAY_NAME} | CRM & client messaging`,
    description: BUSINESS_POSITIONING,
    url: "/",
    siteName: COMPANY_DISPLAY_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPANY_DISPLAY_NAME} | CRM & client messaging`,
    description: BUSINESS_POSITIONING,
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
