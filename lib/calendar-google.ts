/**
 * Google Calendar API helpers: refresh token and push events.
 * Used when user has connected Google Calendar in Settings.
 */

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3"

export type GoogleTokens = {
  access_token: string
  refresh_token?: string
  expires_at?: string | null
  calendar_id?: string | null
}

export async function getValidAccessToken(
  tokens: GoogleTokens,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const expiresAt = tokens.expires_at ? new Date(tokens.expires_at).getTime() : 0
  if (tokens.refresh_token && expiresAt < Date.now() + 60_000) {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokens.refresh_token,
        grant_type: "refresh_token",
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error("Google token refresh failed: " + err)
    }
    const data = (await res.json()) as { access_token: string; expires_in: number }
    return data.access_token
  }
  return tokens.access_token
}

export type CalendarEventPayload = {
  title: string
  start_time: string
  end_time: string
  date: string
  description?: string | null
  location?: string | null
}

export async function createGoogleCalendarEvent(
  tokens: GoogleTokens,
  clientId: string,
  clientSecret: string,
  calendarId: string,
  payload: CalendarEventPayload
): Promise<string | null> {
  const accessToken = await getValidAccessToken(tokens, clientId, clientSecret)
  const start = new Date(payload.date + "T" + payload.start_time)
  const end = new Date(payload.date + "T" + payload.end_time)
  const body = {
    summary: payload.title,
    description: payload.description || undefined,
    location: payload.location || undefined,
    start: { dateTime: start.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    end: { dateTime: end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  }
  const res = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { id?: string }
  return data.id || null
}

export async function updateGoogleCalendarEvent(
  tokens: GoogleTokens,
  clientId: string,
  clientSecret: string,
  calendarId: string,
  googleEventId: string,
  payload: CalendarEventPayload
): Promise<boolean> {
  const accessToken = await getValidAccessToken(tokens, clientId, clientSecret)
  const start = new Date(payload.date + "T" + payload.start_time)
  const end = new Date(payload.date + "T" + payload.end_time)
  const body = {
    summary: payload.title,
    description: payload.description || undefined,
    location: payload.location || undefined,
    start: { dateTime: start.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    end: { dateTime: end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  }
  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  )
  return res.ok
}

export async function deleteGoogleCalendarEvent(
  tokens: GoogleTokens,
  clientId: string,
  clientSecret: string,
  calendarId: string,
  googleEventId: string
): Promise<boolean> {
  const accessToken = await getValidAccessToken(tokens, clientId, clientSecret)
  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}`,
    { method: "DELETE", headers: { Authorization: "Bearer " + accessToken } }
  )
  return res.ok
}
