/**
 * Generate iCalendar (ICS) content for subscription feed.
 * Calendar apps (Apple, Google "Add by URL", Outlook) can subscribe to get updates.
 */

function escapeIcsText(s: string): string {
  if (!s) return ""
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

export type CalendarEventForIcs = {
  id: string
  title: string
  start_time: string
  end_time: string
  date: string
  description?: string | null
  location?: string | null
  updated_at?: string | null
}

export function generateIcs(events: CalendarEventForIcs[], productName = "Portal Calendar"): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//" + productName + "//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ]

  for (const e of events) {
    const dateStr = e.date
    const start = new Date(dateStr + "T" + (e.start_time || "00:00"))
    const end = new Date(dateStr + "T" + (e.end_time || "00:00"))
    const now = e.updated_at ? new Date(e.updated_at) : new Date()
    const uid = "portal-" + e.id + "@calendar"
    lines.push("BEGIN:VEVENT")
    lines.push("UID:" + uid)
    lines.push("DTSTAMP:" + formatIcsDate(now))
    lines.push("DTSTART:" + formatIcsDate(start))
    lines.push("DTEND:" + formatIcsDate(end))
    lines.push("SUMMARY:" + escapeIcsText(e.title || "Event"))
    if (e.description) lines.push("DESCRIPTION:" + escapeIcsText(e.description))
    if (e.location) lines.push("LOCATION:" + escapeIcsText(e.location))
    lines.push("END:VEVENT")
  }

  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}
