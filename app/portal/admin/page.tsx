"use client"

import { useState, useEffect } from "react"
import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, UserPlus, Users, Check, X, Menu, Copy } from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { toast } from "@/hooks/use-toast"

interface JoinRequest {
  id: string
  user_id: string
  email: string
  status: string
  requested_at: string
}

export default function AdminPage() {
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [teamCode, setTeamCode] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [addName, setAddName] = useState("")
  const [addPhone, setAddPhone] = useState("")
  const [addEmail, setAddEmail] = useState("")
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [lastJoinUrl, setLastJoinUrl] = useState<string | null>(null)

  const loadAdminData = () => {
    fetch("/api/workspaces/members")
      .then((res) => res.json())
      .then((data) => {
        setTeamCode(data.teamCode ?? null)
        setIsAdmin(data.currentUserRole === "admin")
      })
      .catch(() => setIsAdmin(false))
  }

  const loadJoinRequests = () => {
    fetch("/api/workspaces/join-requests")
      .then((res) => res.json())
      .then((data) => setJoinRequests(data.requests ?? []))
      .catch(() => setJoinRequests([]))
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  useEffect(() => {
    if (isAdmin) loadJoinRequests()
  }, [isAdmin])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    const phone = addPhone.trim() ? (addPhone.trim().startsWith("+") ? addPhone.trim() : `+1${addPhone.trim()}`) : ""
    const email = addEmail.trim() || ""
    if (!phone && !email) {
      setInviteError("Enter at least a phone number or email.")
      return
    }
    setInviteError("")
    setInviteSending(true)
    setLastJoinUrl(null)
    try {
      const res = await fetch("/api/workspaces/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim() || undefined,
          phone: phone || undefined,
          email: email || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteError(data.error ?? "Failed to send invite")
        return
      }
      if (data.joinUrl) {
        setLastJoinUrl(data.joinUrl)
        toast({ title: "Invite created", description: "Share the link below with them to join." })
      } else {
        toast({ title: "Invite sent", description: "They'll receive a text with a link to join the team." })
      }
      setAddName("")
      setAddPhone("")
      setAddEmail("")
    } catch {
      setInviteError("Something went wrong")
    } finally {
      setInviteSending(false)
    }
  }

  const handleRespondRequest = async (requestId: string, action: "accept" | "reject") => {
    try {
      const res = await fetch(`/api/workspaces/join-requests/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error ?? "Failed", variant: "destructive" })
        return
      }
      toast({
        title: action === "accept" ? "Request accepted" : "Request rejected",
        description: action === "accept" ? "They can now access the team." : "",
      })
      loadJoinRequests()
      loadAdminData()
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
  }

  const copyJoinUrl = () => {
    if (!lastJoinUrl) return
    navigator.clipboard.writeText(lastJoinUrl)
    toast({ title: "Copied", description: "Join link copied to clipboard." })
  }

  if (isAdmin === false) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Admin</h1>
          <Card className="border-white/20 bg-white/5">
            <CardContent className="pt-6">
              <p className="text-white/80">Only workspace admins can access this page.</p>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Expand sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-8 w-8" />
              Admin
            </h1>
            <p className="text-muted-foreground">
              Add people to your team and accept join requests
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Add people */}
          <Card className="border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add people to your team
              </CardTitle>
              <CardDescription className="text-white/70">
                Enter name, phone and/or email. We’ll send a text (if phone) or give you a link to share (if email).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name" className="text-white/90">Name (optional)</Label>
                  <Input
                    id="add-name"
                    type="text"
                    placeholder="Jane Smith"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-phone" className="text-white/90">Phone number</Label>
                  <Input
                    id="add-phone"
                    type="tel"
                    placeholder="+1 555 123 4567"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <p className="text-xs text-white/60">Include country code. They’ll get an SMS with a join link.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-email" className="text-white/90">Email</Label>
                  <Input
                    id="add-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <p className="text-xs text-white/60">We’ll give you a link to copy and send to them.</p>
                </div>
                {inviteError && <p className="text-sm text-red-400">{inviteError}</p>}
                <Button
                  type="submit"
                  disabled={inviteSending || (!addPhone.trim() && !addEmail.trim())}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {inviteSending ? "Sending…" : "Send invite"}
                </Button>
              </form>
              {lastJoinUrl && (
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <p className="text-sm text-white/80">Share this link with them:</p>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={lastJoinUrl}
                      className="bg-white/10 border-white/20 text-white text-sm"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={copyJoinUrl} className="shrink-0 border-white/20 text-white hover:bg-white/10">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team code & Join requests */}
          <div className="space-y-6">
            {teamCode && (
              <Card className="border-white/20 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Team code</CardTitle>
                  <CardDescription className="text-white/70">
                    People can enter this code on Join Team to request access. You approve below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded-lg bg-white/10 flex items-center gap-3">
                    <code className="flex-1 px-2 py-1.5 bg-black/30 rounded font-mono text-white font-medium text-lg">
                      {teamCode}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10 shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(teamCode)
                        toast({ title: "Copied", description: "Team code copied to clipboard." })
                      }}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Pending join requests
                </CardTitle>
                <CardDescription className="text-white/70">
                  Accept or reject people who entered your team code
                </CardDescription>
              </CardHeader>
              <CardContent>
                {joinRequests.length === 0 ? (
                  <p className="text-sm text-white/60 py-4">No pending requests.</p>
                ) : (
                  <ul className="space-y-2">
                    {joinRequests.map((req) => (
                      <li
                        key={req.id}
                        className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <span className="text-white truncate">{req.email}</span>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="sm"
                            className="h-8 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleRespondRequest(req.id, "accept")}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-white/30 text-white hover:bg-white/10"
                            onClick={() => handleRespondRequest(req.id, "reject")}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
