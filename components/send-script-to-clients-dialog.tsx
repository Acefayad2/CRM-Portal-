"use client"

import { useState, useMemo } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useClients } from "@/contexts/clients-context"
import { customizeScriptForClient } from "@/lib/script-customize"
import { validatePhone } from "@/lib/sms-utils"
import type { Script } from "@/lib/scripts-data"
import type { Client } from "@/lib/crm-data"

const MAX_SMS_LENGTH = 1200

function hasValidPhone(client: Client): boolean {
  return validatePhone(client.phone ?? "").valid
}

function truncateForSms(text: string, maxLen: number = MAX_SMS_LENGTH): string {
  const t = text.trim()
  if (t.length <= maxLen) return t
  return t.slice(0, maxLen - 3) + "..."
}

interface SendScriptToClientsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  script: Script | null
  onSent?: () => void
}

export function SendScriptToClientsDialog({
  open,
  onOpenChange,
  script,
  onSent,
}: SendScriptToClientsDialogProps) {
  const { clients } = useClients()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)

  const clientsWithPhone = useMemo(
    () => clients.filter(hasValidPhone),
    [clients]
  )

  const toggleClient = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === clientsWithPhone.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(clientsWithPhone.map((c) => c.id)))
    }
  }

  const selectedClients = useMemo(
    () => clientsWithPhone.filter((c) => selectedIds.has(c.id)),
    [clientsWithPhone, selectedIds]
  )

  const previewClient = selectedClients[0] ?? clientsWithPhone[0]
  const previewMessage = script && previewClient
    ? customizeScriptForClient(script.content, previewClient)
    : ""
  const previewTruncated = truncateForSms(previewMessage)
  const overLimit = previewMessage.length > MAX_SMS_LENGTH

  const handleSend = async () => {
    if (!script || selectedClients.length === 0) return
    setSending(true)
    let success = 0
    let failed = 0
    for (const client of selectedClients) {
      const message = truncateForSms(
        customizeScriptForClient(script.content, client)
      )
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: client.phone, message }),
      })
      const data = await res.json()
      if (data.success) {
        success++
      } else {
        failed++
      }
    }
    if (success > 0 && script.id) {
      try {
        await fetch(`/api/scripts/${script.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ incrementUsage: true }),
        })
      } catch {
        // ignore
      }
    }
    setSending(false)
    if (success > 0) {
      toast({
        title: "Script sent",
        description: `Sent to ${success} client${success !== 1 ? "s" : ""}${failed ? `; ${failed} failed.` : "."}`,
      })
      onSent?.()
      onOpenChange(false)
      setSelectedIds(new Set())
    }
    if (failed > 0 && success === 0) {
      toast({
        title: "Send failed",
        description: "Could not send to any client. Check SMS setup and phone numbers.",
        variant: "destructive",
      })
    }
  }

  if (!script) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send script to clients
          </DialogTitle>
          <DialogDescription>
            Choose clients to text this script to. The message is personalized per client using placeholders like {"{{name}}"}, {"{{firstName}}"}, {"{{lastName}}"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Clients with phone numbers</Label>
              {clientsWithPhone.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={selectAll}
                >
                  {selectedIds.size === clientsWithPhone.length ? "Deselect all" : "Select all"}
                </Button>
              )}
            </div>
            {clientsWithPhone.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No clients have a valid phone number. Add a phone (e.g. +15551234567) in the Clients section.
              </p>
            ) : (
              <ScrollArea className="h-[200px] rounded-md border p-2">
                <div className="space-y-2">
                  {clientsWithPhone.map((client) => (
                    <label
                      key={client.id}
                      className="flex items-center gap-2 cursor-pointer rounded p-2 hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedIds.has(client.id)}
                        onCheckedChange={() => toggleClient(client.id)}
                      />
                      <span className="text-sm">
                        {client.firstName} {client.lastName}
                        <span className="text-muted-foreground"> · {client.phone}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          {previewClient && previewMessage && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Preview for {previewClient.firstName} {previewClient.lastName}
              </Label>
              <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap max-h-24 overflow-y-auto">
                {previewTruncated}
              </div>
              {overLimit && (
                <p className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  Message over SMS limit; it will be truncated to {MAX_SMS_LENGTH} characters.
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedClients.length === 0 || sending || clientsWithPhone.length === 0}
          >
            {sending ? "Sending..." : `Send to ${selectedClients.length} client${selectedClients.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
