"use client"

import { useMemo, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useContactLogs } from "@/contexts/contact-logs-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Calendar,
  Upload,
  UserPlus,
  TrendingUp,
  Clock,
  CheckCircle,
  Info,
} from "lucide-react"

const PIPELINE_STORAGE_KEY = "portal-pipeline"
const pipelineStatuses = [
  { status: "New", color: "bg-blue-500" },
  { status: "Contacted", color: "bg-yellow-500" },
  { status: "Appt Set", color: "bg-purple-500" },
  { status: "Presented", color: "bg-orange-500" },
  { status: "Follow-Up", color: "bg-pink-500" },
] as const

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
  const key = getWeekKey()
  const monday = new Date(key)
  return monday.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const followUps: Array<{
  id: number
  name: string
  phone: string
  email: string
  reason: string
  priority: string
}> = []

const upcomingAppointments: Array<{
  id: number
  client: string
  type: string
  date: string
  time: string
  location: string
}> = []


export function PipelineCard() {
  const weekKey = useMemo(() => getWeekKey(), [])
  const weekLabel = useMemo(() => getWeekLabel(), [])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const { contactedThisWeekCount } = useContactLogs()

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(PIPELINE_STORAGE_KEY)
      if (!stored) {
        localStorage.setItem(
          PIPELINE_STORAGE_KEY,
          JSON.stringify({ week: weekKey, counts: {} }),
        )
        return
      }
      const parsed = JSON.parse(stored)
      if (parsed.week !== weekKey) {
        setCounts({})
        localStorage.setItem(
          PIPELINE_STORAGE_KEY,
          JSON.stringify({ week: weekKey, counts: {} }),
        )
        return
      }
      setCounts(parsed.counts || {})
    } catch {
      setCounts({})
    }
  }, [weekKey])

  const pipelineData = useMemo(
    () =>
      pipelineStatuses.map((item) => ({
        ...item,
        count:
          item.status === "Contacted"
            ? contactedThisWeekCount
            : counts[item.status] ?? 0,
      })),
    [counts, contactedThisWeekCount],
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              My Pipeline
            </CardTitle>
            <CardDescription>
              Current status of all prospects — resets every week (Week of {weekLabel})
            </CardDescription>
          </div>
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full text-white/70 hover:text-white hover:bg-white/10"
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
              <h4 className="font-semibold mb-2">How the pipeline works</h4>
              <ul className="text-sm space-y-2 text-white/90">
                <li>
                  <strong>Contacted</strong> — Automatically counts each unique
                  client you call, text, or email this week. When someone shows
                  up in Recently Contacted (e.g. John Doe), they&apos;re counted here.
                </li>
                <li>
                  <strong>Weekly reset</strong> — Counts reset every Monday at
                  midnight for the new week (Mon–Sun).
                </li>
                <li>
                  <strong>New, Appt Set, Presented, Follow-Up</strong> — Update
                  these manually as prospects move through your pipeline.
                </li>
              </ul>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {pipelineData.map((item) => (
            <div key={item.status} className="text-center space-y-2">
              <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mx-auto border-0 shadow-lg`}>
                <span className="text-white font-bold text-lg">{item.count}</span>
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
  const handleAction = (action: string, contact: any) => {
    console.log(`${action} action for ${contact.name}`)
    // Here you would implement the actual action
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Today's Follow-Ups
        </CardTitle>
        <CardDescription>Contacts that need attention today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {followUps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No follow-ups scheduled</p>
        ) : (
          followUps.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
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
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost" onClick={() => handleAction("call", contact)} className="h-8 w-8 p-0">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleAction("text", contact)} className="h-8 w-8 p-0">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleAction("email", contact)} className="h-8 w-8 p-0">
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Upcoming Appointments
        </CardTitle>
        <CardDescription>Next 5 scheduled meetings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingAppointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>
        ) : (
          upcomingAppointments.map((appointment) => (
          <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {appointment.client
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
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
          <CheckCircle className="h-5 w-5 mr-2" />
          Recently Contacted
        </CardTitle>
        <CardDescription>Timeline of recent client interactions (calls, texts, emails)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentContacts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent contacts — click call, text, or email on a client to log</p>
        ) : (
          recentContacts.map((contact) => (
            <div key={contact.id} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{contact.clientName}</p>
                  <p className="text-xs text-muted-foreground">{contact.timestamp}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {contact.action} — {contact.outcome}
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
          <Plus className="h-5 w-5 mr-2" />
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
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent border-white/20 hover:bg-white/10 hover:border-white/30 text-white"
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
