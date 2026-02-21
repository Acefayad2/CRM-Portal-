"use client"

import { useState, useEffect, useRef } from "react"
import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UsersRound, Send, Menu, UserPlus, MessageSquare, Check, X } from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { toast } from "@/hooks/use-toast"

interface Teammate {
  id: string
  email: string
  role: string
}

interface JoinRequest {
  id: string
  user_id: string
  email: string
  status: string
  requested_at: string
}

interface ChatMessage {
  id: string
  userId: string
  userEmail: string
  message: string
  createdAt: string
}

export default function TeamPage() {
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [members, setMembers] = useState<Teammate[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [teamCode, setTeamCode] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Teammate | null>(null)
  const [loading, setLoading] = useState(true)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [invitePhone, setInvitePhone] = useState("")
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadMembers = () => {
    fetch("/api/workspaces/members")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data.members ?? [])
        setCurrentUserId(data.currentUserId ?? null)
        setTeamCode(data.teamCode ?? null)
        setCurrentUserRole(data.currentUserRole ?? null)
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }

  const loadMessages = () => {
    fetch("/api/team/chat")
      .then((res) => res.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setMessages([]))
  }

  const loadJoinRequests = () => {
    fetch("/api/workspaces/join-requests")
      .then((res) => res.json())
      .then((data) => setJoinRequests(data.requests ?? []))
      .catch(() => setJoinRequests([]))
  }

  useEffect(() => {
    loadMembers()
    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (currentUserRole === "admin") loadJoinRequests()
  }, [currentUserRole])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const msg = newMessage.trim()
    if (!msg || sending) return
    setSending(true)
    try {
      const res = await fetch("/api/team/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      if (res.ok && data.id) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id,
            userId: data.userId,
            userEmail: data.userEmail ?? "You",
            message: data.message,
            createdAt: data.createdAt,
          },
        ])
        setNewMessage("")
      }
    } finally {
      setSending(false)
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
      loadMembers()
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    }
  }

  const handleSendInvite = async () => {
    const phone = invitePhone.trim()
    if (!phone) return
    setInviteError("")
    setInviteSending(true)
    try {
      const res = await fetch("/api/workspaces/invite-by-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.startsWith("+") ? phone : `+1${phone}` }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteError(data.error ?? "Failed to send invite")
        return
      }
      toast({ title: "Invite sent", description: "They'll receive a text with a link to join the team." })
      setInviteDialogOpen(false)
      setInvitePhone("")
    } catch {
      setInviteError("Something went wrong")
    } finally {
      setInviteSending(false)
    }
  }

  const getInitials = (email: string) => {
    const part = email.split("@")[0]
    if (part.includes(".")) {
      return part
        .split(".")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    }
    return part.slice(0, 2).toUpperCase()
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3">
            {isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Expand sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-3xl font-bold text-foreground">Team</h1>
          </div>
          <p className="text-muted-foreground">
            View team members and chat with your workspace
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Team members list */}
          <Card className="border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <UsersRound className="h-5 w-5" />
                Team members
              </CardTitle>
              <CardDescription className="text-white/70">
                {currentUserRole === "admin" && teamCode
                  ? "Share your team code so others can join"
                  : "Click a member to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentUserRole === "admin" && teamCode && (
                <div className="mb-4 space-y-3">
                  <div className="p-3 rounded-lg bg-white/10 flex items-center gap-3">
                    <span className="text-sm text-white/70">Team code:</span>
                    <code className="flex-1 px-2 py-1.5 bg-black/30 rounded font-mono text-white font-medium">
                      {teamCode}
                    </code>
                  </div>
                  <p className="text-xs text-white/60">
                    Share this code so others can request to join. You must approve each request.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                    onClick={() => setInviteDialogOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Invite by text message
                  </Button>
                </div>
              )}
              {currentUserRole === "admin" && joinRequests.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
                  <p className="text-sm font-medium text-amber-200 mb-2">Pending join requests</p>
                  <ul className="space-y-2">
                    {joinRequests.map((req) => (
                      <li
                        key={req.id}
                        className="flex items-center justify-between gap-2 text-sm text-white/90"
                      >
                        <span className="truncate">{req.email}</span>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="sm"
                            className="h-8 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleRespondRequest(req.id, "accept")}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-white/30 text-white hover:bg-white/10"
                            onClick={() => handleRespondRequest(req.id, "reject")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {loading ? (
                <p className="text-sm text-muted-foreground py-4">Loading...</p>
              ) : members.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No team members yet. Share your team code so others can join.
                </p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-white/10 ${
                        selectedMember?.id === member.id ? "bg-white/10" : ""
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-white/20 text-white">
                          {getInitials(member.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {member.email}
                        </p>
                        <p className="text-xs text-white/60 capitalize">
                          {member.role}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team chat */}
          <Card className="lg:col-span-2 border-white/20 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Send className="h-5 w-5" />
                Team chat
              </CardTitle>
              <CardDescription className="text-white/70">
                Message everyone in your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 min-h-0 p-0">
              <div
                ref={messagesRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] min-h-[200px]"
              >
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No messages yet. Say hello to your team!
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col gap-0.5 ${
                        m.userId === currentUserId ? "items-end" : "items-start"
                      }`}
                    >
                      <p className="text-xs text-white/60">
                        {m.userEmail}
                        {m.userId === currentUserId ? " (you)" : ""}
                      </p>
                      <div
                        className={`rounded-lg px-3 py-2 max-w-[80%] ${
                          m.userId === currentUserId
                            ? "bg-blue-500/80 text-white"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        <p className="text-sm break-words">{m.message}</p>
                      </div>
                      <p className="text-xs text-white/50">
                        {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-white/20 flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="bg-blue-500 hover:bg-blue-600 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member detail sheet */}
        <Sheet open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
          <SheetContent className="w-full sm:max-w-md border-white/20 bg-black/90">
            <SheetHeader>
              <SheetTitle className="text-white">
                {selectedMember?.email}
              </SheetTitle>
              <SheetDescription className="text-white/70">
                {selectedMember && (
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-white/20 text-white text-xl">
                        {getInitials(selectedMember.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{selectedMember.email}</p>
                      <p className="text-sm text-white/60 capitalize">{selectedMember.role}</p>
                    </div>
                  </div>
                )}
              </SheetDescription>
            </SheetHeader>
            {selectedMember && (
              <div className="mt-6 space-y-4">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    setNewMessage(`@${selectedMember.email} `)
                    setSelectedMember(null)
                    setTimeout(() => inputRef.current?.focus(), 100)
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Mention in chat
                </Button>
                <p className="text-sm text-white/60">
                  Mentioning will add their name to your message in the team chat.
                </p>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Invite by SMS dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent className="sm:max-w-md border-white/20 bg-black/95">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite by text message
              </DialogTitle>
              <DialogDescription className="text-white/70">
                Enter their phone number. They&apos;ll receive an SMS with a link to sign up or log in and join your team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="invite-phone" className="text-white/90">Phone number</Label>
                <Input
                  id="invite-phone"
                  type="tel"
                  placeholder="+1 555 123 4567"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <p className="text-xs text-white/60">Include country code (e.g. +1 for US)</p>
              </div>
              {inviteError && (
                <p className="text-sm text-red-400">{inviteError}</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button
                onClick={handleSendInvite}
                disabled={!invitePhone.trim() || inviteSending}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {inviteSending ? "Sending..." : "Send invite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  )
}
