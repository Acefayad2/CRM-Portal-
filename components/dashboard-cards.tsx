"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
} from "lucide-react"

const pipelineData = [
  { status: "New", count: 0, color: "bg-blue-500" },
  { status: "Contacted", count: 0, color: "bg-yellow-500" },
  { status: "Appt Set", count: 0, color: "bg-purple-500" },
  { status: "Presented", count: 0, color: "bg-orange-500" },
  { status: "Follow-Up", count: 0, color: "bg-pink-500" },
  { status: "App Submitted", count: 0, color: "bg-indigo-500" },
  { status: "Pending UW", count: 0, color: "bg-cyan-500" },
  { status: "In Force", count: 0, color: "bg-green-500" },
]

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

const recentContacts: Array<{
  id: number
  client: string
  action: string
  time: string
  outcome: string
}> = []

export function PipelineCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          My Pipeline
        </CardTitle>
        <CardDescription>Current status of all prospects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineData.map((item) => (
            <div key={item.status} className="text-center space-y-2">
              <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mx-auto`}>
                <span className="text-white font-bold text-lg">{item.count}</span>
              </div>
              <p className="text-sm font-medium">{item.status}</p>
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Recently Contacted
        </CardTitle>
        <CardDescription>Timeline of recent client interactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentContacts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent contacts</p>
        ) : (
          recentContacts.map((contact) => (
          <div key={contact.id} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{contact.client}</p>
                <p className="text-xs text-muted-foreground">{contact.time}</p>
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
    { name: "Upload File", icon: Upload, href: "/portal/resources?action=upload" },
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
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
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
