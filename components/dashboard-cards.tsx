"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useContactLogs } from "@/contexts/contact-logs-context"
import { useClients } from "@/contexts/clients-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { buildFollowUps, buildPipelineCounts, buildUpcomingAppointments, type CalendarEventSummary } from "@/lib/portal-insights"
import {
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Calendar,
  UserPlus,
  TrendingUp,
  Clock,
  CheckCircle,
  Info,
} from "lucide-react"

function getWeekKey(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

function getWeekLabel(): string {
  const monday = new Date(getWeekKey())
  return monday.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function PipelineCard() {
  const { clients } = useClients()
  const { contactedThisWeekCount } = useContactLogs()
  const [events, setEvents] = useState<CalendarEventSummary[]>([])
  const weekLabel = useMemo(() => getWeekLabel(), [])

  useEffect(() => {
    let cancelled = false
    fetch("/api/calendar/events")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return
        if (ok && Array.isArray(data?.events)) {
          setEvents(data.events)
          return
        }
        setEvents([])
      })
      .catch(() => {
        if (!cancelled) setEvents([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const pipelineStatuses = useMemo(
    () => [
      { status: "New", color: "bg-blue-500" },
      { status: "Contacted", color: "bg-yellow-500" },
      { status: "Appt Set", color: "bg-purple-500" },
      { status: "Presented", color: "bg-orange-500" },
      { status: "Follow-Up", color: "bg-pink-500" },
    ],
    []
  )

  const counts = useMemo(
    () => buildPipelineCounts(clients, contactedThisWeekCount, events),
    [clients, contactedThisWeekCount, events]
  )

  const pipelineData = pipelineStatuses.map((item) => ({
    ...item,
    count: counts[item.status] ?? 0,
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              My Pipeline
            </CardTitle>
            <CardDescription>
              Derived from live client stages and upcoming appointments (Week of {weekLabel})
            </CardDescription>
          </div>
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="How the pipeline works"
              >
                <Info className="h-5 w-5" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent
              side="left"
              align="start"
              sideOffset={8}
              className="w-80 border-white/20 bg-black/95 text-white shadow-xl"
            >
              <h4 className="mb-2 font-semibold">How the pipeline works</h4>
              <ul className="space-y-2 text-sm text-white/90">
                <li><strong>New</strong> reflects clients with `New Lead` status.</li>
                <li><strong>Contacted</strong> counts unique clients touched this week.</li>
                <li><strong>Appt Set</strong> uses upcoming calendar events.</li>
                <li><strong>Presented</strong> is based on proposal, negotiation, or won stages.</li>
                <li><strong>Follow-Up</strong> reflects clients explicitly marked for follow-up.</li>
              </ul>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {pipelineData.map((item) => (
            <div key={item.status} className="space-y-2 text-center">
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${item.color} shadow-lg`}>
                <span className="text-lg font-bold text-white">{item.count}</span>
              </div>
              <p className="text-sm font-medium text-white">{item.status}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function FollowUpsCard() {
  const { clients } = useClients()
  const { recentContacts } = useContactLogs()
  const followUps = useMemo(() => buildFollowUps(clients, recentContacts), [clients, recentContacts])

  const handleAction = (action: "call" | "text" | "email", contact: (typeof followUps)[number]) => {
    if (action === "call") window.open(`tel:${contact.phone}`)
    if (action === "text") window.open(`sms:${contact.phone}`)
    if (action === "email") window.open(`mailto:${contact.email}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Today's Follow-Ups
        </CardTitle>
        <CardDescription>Clients needing attention based on stage and stale contact activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {followUps.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No follow-ups due right now</p>
        ) : (
          followUps.map((contact) => (
            <div key={contact.id} className="flex flex-col gap-3 rounded-lg bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{contact.name}</p>
                  <Badge
                    variant={
                      contact.priority === "high"
                        ? "destructive"
                        : contact.priority === "medium"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {contact.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{contact.reason}</p>
              </div>
              <div className="flex shrink-0 justify-end gap-1 sm:justify-start">
                <Button size="sm" variant="ghost" onClick={() => handleAction("call", contact)} className="h-9 w-9 p-0 sm:h-8 sm:w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleAction("text", contact)} className="h-9 w-9 p-0 sm:h-8 sm:w-8">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleAction("email", contact)} className="h-9 w-9 p-0 sm:h-8 sm:w-8">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function AppointmentsCard() {
  const [events, setEvents] = useState<CalendarEventSummary[]>([])

  useEffect(() => {
    let cancelled = false
    fetch("/api/calendar/events")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return
        if (ok && Array.isArray(data?.events)) {
          setEvents(data.events)
          return
        }
        setEvents([])
      })
      .catch(() => {
        if (!cancelled) setEvents([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const upcomingAppointments = useMemo(() => buildUpcomingAppointments(events), [events])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Upcoming Appointments
        </CardTitle>
        <CardDescription>Next 5 scheduled meetings from your calendar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingAppointments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No upcoming appointments</p>
        ) : (
          upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {appointment.client
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{appointment.client}</p>
                  <p className="text-sm text-muted-foreground">{appointment.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{appointment.date}</p>
                <p className="text-sm text-muted-foreground">{appointment.time}</p>
                <p className="text-xs text-muted-foreground">{appointment.location}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function RecentContactsCard() {
  const { recentContacts } = useContactLogs()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="mr-2 h-5 w-5" />
          Recently Contacted
        </CardTitle>
        <CardDescription>Timeline of recent client interactions (calls, texts, emails)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentContacts.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No recent contacts yet. Use the client actions to start logging touches.</p>
        ) : (
          recentContacts.map((contact) => (
            <div key={contact.id} className="flex items-start space-x-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-accent"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{contact.clientName}</p>
                  <p className="text-xs text-muted-foreground">{contact.timestamp}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {contact.action} - {contact.outcome}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function QuickLinksCard() {
  const quickLinks = [
    { name: "Create Client", icon: UserPlus, href: "/portal/clients?action=create" },
    { name: "Log Contact", icon: Phone, href: "/portal/clients?action=log" },
    { name: "New Appointment", icon: Calendar, href: "/portal/calendars?action=create" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="mr-2 h-5 w-5" />
          Quick Links
        </CardTitle>
        <CardDescription>Common actions and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Button
              key={link.name}
              variant="outline"
              className="flex h-auto flex-col items-center space-y-2 border-white/20 bg-transparent p-4 text-white hover:border-white/30 hover:bg-white/10"
              asChild
            >
              <a href={link.href}>
                <link.icon className="h-6 w-6" />
                <span className="text-sm">{link.name}</span>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
