"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Share2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Client } from "@/lib/crm-data"

interface Teammate {
  id: string
  email: string
  role: string
}

interface SendClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
  onSent?: () => void
}

export function SendClientDialog({
  open,
  onOpenChange,
  client,
  onSent,
}: SendClientDialogProps) {
  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedId, setSelectedId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    setSelectedId("")
    fetch("/api/workspaces/members")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
          setTeammates([])
        } else {
          const members = data.members ?? []
          const currentUserId = data.currentUserId
          setTeammates(currentUserId ? members.filter((t: Teammate) => t.id !== currentUserId) : members)
        }
      })
      .catch(() => {
        setError("Failed to load teammates")
        setTeammates([])
      })
      .finally(() => setLoading(false))
  }, [open])

  const handleSend = async () => {
    if (!client || !selectedId) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch("/api/clients/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, toUserId: selectedId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to share")
        return
      }
      const teammateEmail = selected?.email ?? "Teammate"
      toast({
        title: "Contact shared",
        description: `${client.firstName} ${client.lastName} was shared with ${teammateEmail}.`,
      })
      onSent?.()
      onOpenChange(false)
    } catch {
      setError("Failed to send")
    } finally {
      setSending(false)
    }
  }

  const selected = teammates.find((t) => t.id === selectedId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share contact with teammate
          </DialogTitle>
          <DialogDescription>
            {client
              ? `Share ${client.firstName} ${client.lastName} with a team member. They'll see the contact in "Shared with me" and can add it to their clients.`
              : "Select a client first."}
          </DialogDescription>
        </DialogHeader>
        {client && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Teammate</Label>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading teammates...</p>
              ) : teammates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {error
                    ? error
                    : "No teammates in your workspace. Share your team code so others can join."}
                </p>
              ) : (
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teammate" />
                  </SelectTrigger>
                  <SelectContent>
                    {teammates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.email} {t.role === "admin" ? "(Admin)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={!selectedId || sending || teammates.length === 0}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {sending ? "Sharing..." : "Share"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
