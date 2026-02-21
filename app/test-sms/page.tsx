"use client"

/**
 * Dev-only Test SMS page
 * Navigate to /test-sms to send test texts and verify Twilio integration.
 */
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const DEFAULT_TO = "+18777804236"

export default function TestSMSPage() {
  const [phone, setPhone] = useState(DEFAULT_TO)
  const [fromNumber, setFromNumber] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/sms/config")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setFromNumber(data?.from ?? null))
      .catch(() => setFromNumber(null))
  }, [])
  const [message, setMessage] = useState("Ahoy 👋")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; sid?: string; error?: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone.trim(), message: message.trim() }),
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Request failed",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/portal" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Portal
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test SMS</CardTitle>
            <CardDescription>
              {fromNumber && (
                <span className="block mb-1">Sending from: <strong>{fromNumber}</strong></span>
              )}
              Enter the recipient phone in E.164 format (e.g. +18777804236).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">To (phone number)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+18777804236"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={1200}
                />
                <p className="text-xs text-muted-foreground">
                  {message.length} / 1200 characters
                </p>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send SMS"}
              </Button>
            </form>

            {result && (
              <div
                className={`mt-6 rounded-lg border p-4 ${
                  result.success
                    ? "border-green-500/50 bg-green-500/10"
                    : "border-destructive/50 bg-destructive/10"
                }`}
              >
                {result.success ? (
                  <p className="text-sm">
                    <strong>Success!</strong> Message SID: <code className="font-mono text-xs">{result.sid}</code>
                  </p>
                ) : (
                  <p className="text-sm text-destructive">
                    <strong>Error:</strong> {result.error}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Setup notes</CardTitle>
            <CardDescription>
              For local dev with inbound replies and delivery status:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. <code>npm install twilio</code> (already done)</p>
            <p>2. <code>npm run dev</code></p>
            <p>3. <code>ngrok http 3000</code></p>
            <p>4. Add <code>TWILIO_WEBHOOK_BASE_URL</code> to .env.local with your ngrok URL</p>
            <p>5. In Twilio Console → Phone Numbers → [Your Number]:</p>
            <ul className="ml-4 list-disc">
              <li>A MESSAGE COMES IN → https://&lt;ngrok&gt;/api/twilio/webhook</li>
              <li>STATUS CALLBACK URL → https://&lt;ngrok&gt;/api/twilio/webhook</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
