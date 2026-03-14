"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek } from "date-fns"
import Image from "next/image"
import { PortalSidebar } from "@/components/portal-sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Menu,
  Clock,
  MapPin,
  Users,
  Calendar,
  UserPlus,
  RefreshCw,
  Copy,
  ExternalLink,
  CheckCircle2,
  X,
} from "lucide-react"
import { TeammatesCalendarView } from "@/components/teammates-calendar-view"
import { DatePicker } from "@/components/date-picker"
import { RequestManagementPanel } from "@/components/time-slot-request-modal"
import { Button } from "@/components/ui/button"

export default function CalendarsPage() {
  const { isCollapsed, toggleSidebar } = useSidebar()
  // Calendar events - empty by default, user will add their own
  const events: any[] = []
  const [isLoaded, setIsLoaded] = useState(false)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [newEvent, setNewEvent] = useState({
    id: 0,
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    color: "bg-blue-500",
    date: new Date().toISOString().split("T")[0],
    day: new Date().getDay() || 7,
    description: "",
    location: "",
    attendees: [] as string[],
    organizer: "You",
    isRecurring: false,
    recurrencePattern: "weekly",
    recurrenceEndDate: "",
    isVisible: true, // Show to teammates by default
    isTimeBlock: false, // Personal time block
  })
  const [attendeeInput, setAttendeeInput] = useState("")
  const [eventClientId, setEventClientId] = useState<string>("")
  const [eventAttendeePhones, setEventAttendeePhones] = useState<string>("")
  const [calendarClients, setCalendarClients] = useState<Array<{ id: string; firstName: string; lastName: string }>>([])
  const [allEvents, setAllEvents] = useState(events)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const colorOptions = [
    { name: "Blue", value: "bg-blue-500" },
    { name: "Green", value: "bg-green-500" },
    { name: "Purple", value: "bg-purple-500" },
    { name: "Yellow", value: "bg-yellow-500" },
    { name: "Indigo", value: "bg-indigo-500" },
    { name: "Pink", value: "bg-pink-500" },
    { name: "Teal", value: "bg-teal-500" },
    { name: "Cyan", value: "bg-cyan-500" },
    { name: "Orange", value: "bg-orange-500" },
    { name: "Red", value: "bg-red-500" },
  ]

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Load clients when create-event modal is open (for reminder recipient dropdown)
  useEffect(() => {
    if (!showCreateEventModal) return
    fetch("/api/clients")
      .then((res) => (res.ok ? res.json() : { clients: [] }))
      .then((data) => {
        if (data?.clients && Array.isArray(data.clients)) {
          setCalendarClients(
            data.clients.map((c: { id: string; firstName?: string; lastName?: string }) => ({
              id: c.id,
              firstName: c.firstName ?? "",
              lastName: c.lastName ?? "",
            }))
          )
        }
      })
      .catch(() => setCalendarClients([]))
  }, [showCreateEventModal])

  // Load calendar events from API (persisted; syncs to Google/mobile when connected)
  useEffect(() => {
    let cancelled = false
    setEventsLoading(true)
    setEventsError(null)
    fetch("/api/calendar/events")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return
        if (ok && data?.events && Array.isArray(data.events)) {
          setAllEvents(data.events)
        }
        if (data?.error || !ok) setEventsError(data?.error ?? "Failed to load events")
      })
      .catch(() => {
        if (!cancelled) {
          setEventsError("Failed to load events")
          setAllEvents([])
        }
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const [currentView, setCurrentView] = useState<"day" | "week" | "month">("week")
  const [currentDateState, setCurrentDateState] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSyncCalendarModal, setShowSyncCalendarModal] = useState(false)
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false)
  const [calendarFeedUrl, setCalendarFeedUrl] = useState("")
  const [calendarFeedLoading, setCalendarFeedLoading] = useState(false)
  const [calendarNotice, setCalendarNotice] = useState<string | null>(null)
  const [calendarNoticeType, setCalendarNoticeType] = useState<"success" | "error" | "info">("info")

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch("/api/calendar/google/status").then((res) => (res.ok ? res.json() : { connected: false })),
      fetch("/api/calendar/feed/token").then((res) => (res.ok ? res.json() : { feedUrl: "" })),
    ])
      .then(([statusData, feedData]) => {
        if (cancelled) return
        setGoogleCalendarConnected(Boolean(statusData?.connected))
        setCalendarFeedUrl(typeof feedData?.feedUrl === "string" ? feedData.feedUrl : "")
      })
      .catch(() => {
        if (cancelled) return
        setGoogleCalendarConnected(false)
        setCalendarFeedUrl("")
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    if (params.get("google") === "connected") {
      setGoogleCalendarConnected(true)
      setCalendarNoticeType("success")
      setCalendarNotice("Google Calendar connected successfully. New events will sync to your primary calendar.")
      window.history.replaceState({}, "", window.location.pathname)
      return
    }
    const error = params.get("error")
    if (error) {
      setCalendarNoticeType("error")
      setCalendarNotice(error.replaceAll("_", " "))
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
  }

  const loadCalendarFeedUrl = async () => {
    setCalendarFeedLoading(true)
    try {
      const res = await fetch("/api/calendar/feed/token")
      const data = await res.json().catch(() => ({}))
      if (!res.ok || typeof data?.feedUrl !== "string" || !data.feedUrl) {
        throw new Error(data?.error ?? "Could not generate calendar link")
      }
      setCalendarFeedUrl(data.feedUrl)
      return data.feedUrl as string
    } catch (error) {
      setCalendarNoticeType("error")
      setCalendarNotice(error instanceof Error ? error.message : "Could not generate calendar link")
      return ""
    } finally {
      setCalendarFeedLoading(false)
    }
  }

  const handleGoogleCalendarSync = async () => {
    setIsSyncing(true)
    window.location.href = "/api/calendar/google/connect?next=/portal/calendars"
  }

  const handleAppleCalendarSync = async () => {
    const feedUrl = calendarFeedUrl || (await loadCalendarFeedUrl())
    if (!feedUrl || typeof window === "undefined") return
    const webcalUrl = feedUrl.replace(/^https?:\/\//i, "webcal://")
    window.location.href = webcalUrl
    setCalendarNoticeType("success")
    setCalendarNotice("Use the subscription prompt in Apple Calendar to finish connecting your personal calendar feed.")
  }

  const handleDisconnectGoogle = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch("/api/calendar/google/disconnect", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCalendarNoticeType("error")
        setCalendarNotice(data?.error ?? "Failed to disconnect Google Calendar.")
        return
      }
      setGoogleCalendarConnected(false)
      setCalendarNoticeType("success")
      setCalendarNotice("Google Calendar disconnected.")
    } catch {
      setCalendarNoticeType("error")
      setCalendarNotice("Failed to disconnect Google Calendar.")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCopyCalendarFeed = async () => {
    const feedUrl = calendarFeedUrl || (await loadCalendarFeedUrl())
    if (!feedUrl) return
    await navigator.clipboard.writeText(feedUrl)
    setCalendarNoticeType("success")
    setCalendarNotice("Calendar subscription link copied.")
  }

  // Helper functions for date navigation
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday as first day
    return new Date(d.setDate(diff))
  }

  const getEndOfWeek = (date: Date) => {
    const start = getStartOfWeek(date)
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)
  }

  const getWeekDates = (date: Date) => {
    const start = getStartOfWeek(date)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  const navigateDate = (direction: "prev" | "next" | "today") => {
    const newDate = new Date(currentDateState)
    if (direction === "today") {
      setCurrentDateState(new Date())
    } else if (direction === "prev") {
      if (currentView === "day") {
        newDate.setDate(newDate.getDate() - 1)
      } else if (currentView === "week") {
        newDate.setDate(newDate.getDate() - 7)
      } else if (currentView === "month") {
        newDate.setMonth(newDate.getMonth() - 1)
      }
      setCurrentDateState(newDate)
    } else if (direction === "next") {
      if (currentView === "day") {
        newDate.setDate(newDate.getDate() + 1)
      } else if (currentView === "week") {
        newDate.setDate(newDate.getDate() + 7)
      } else if (currentView === "month") {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      setCurrentDateState(newDate)
    }
  }

  // Format date display based on view
  const getDateDisplay = () => {
    if (currentView === "day") {
      return format(currentDateState, "EEEE, MMMM d, yyyy")
    } else if (currentView === "week") {
      const weekStart = getStartOfWeek(currentDateState)
      const weekEnd = getEndOfWeek(currentDateState)
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${format(weekStart, "MMMM d")} - ${format(weekEnd, "d, yyyy")}`
      } else {
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
      }
    } else {
      return format(currentDateState, "MMMM yyyy")
    }
  }

  // Calendar days for the week view
  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  const weekDates = getWeekDates(currentDateState)
  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6) // 6 AM to 10 PM

  // Helper function to calculate event position and height (safe for malformed time strings)
  const parseTimeToHours = (timeStr: string) => {
    const [h, m] = String(timeStr).trim().split(":")
    const hours = Number.parseInt(h ?? "0", 10)
    const mins = Number.parseInt(m ?? "0", 10)
    if (Number.isNaN(hours) || Number.isNaN(mins)) return 0
    return hours + mins / 60
  }
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = parseTimeToHours(startTime)
    const end = Math.max(start, parseTimeToHours(endTime))
    const top = Math.max(0, (start - 6) * 64) // 64px per hour, starting from 6 AM
    const height = Math.max(16, (end - start) * 64)
    return { top: `${top}px`, height: `${height}px` }
  }


  // User calendars - empty by default
  const myCalendars: Array<{ name: string; color: string }> = []

  // Teammates from workspace; availability only for those with shareAvailability on
  const [teammates, setTeammates] = useState<
    Array<{
      id: string
      name: string
      email: string
      shareAvailability: boolean
      allowTimeSlotRequests: boolean
      events: Array<{
        id: string
        title: string
        startTime: string
        endTime: string
        date: string
        color: string
        day: number
        isVisible?: boolean
        isTimeBlock?: boolean
      }>
    }>
  >([])
  const [teammatesLoading, setTeammatesLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setTeammatesLoading(true)
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const startStr = format(weekStart, "yyyy-MM-dd")
    const endStr = format(weekEnd, "yyyy-MM-dd")

    fetch("/api/workspaces/members")
      .then((res) => (res.ok ? res.json() : { members: [], currentUserId: null }))
      .then((data) => {
        if (cancelled || !data?.members?.length) {
          if (!cancelled) setTeammates([])
          return
        }
        const currentUserId = data.currentUserId as string | null
        const others = (data.members as Array<{ id: string; email: string; role: string; shareAvailability?: boolean; allowTimeSlotRequests?: boolean }>).filter(
          (m) => m.id !== currentUserId
        )
        if (others.length === 0) {
          setTeammates([])
          return
        }
        const nameFromEmail = (email: string) => {
          const part = email.replace(/@.*/, "").replace(/[._]/g, " ")
          return part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : "Teammate"
        }
        Promise.all(
          others.map((m) => {
            const shareAvailability = m.shareAvailability !== false
            const allowTimeSlotRequests = m.allowTimeSlotRequests !== false
            if (!shareAvailability) {
              return Promise.resolve({
                id: m.id,
                name: nameFromEmail(m.email),
                email: m.email,
                shareAvailability: false as const,
                allowTimeSlotRequests,
                events: [] as Array<{ id: string; title: string; startTime: string; endTime: string; date: string; color: string; day: number; isVisible?: boolean; isTimeBlock?: boolean }>,
              })
            }
            return fetch(
              `/api/calendar/teammate-events?userId=${encodeURIComponent(m.id)}&start=${startStr}&end=${endStr}`
            )
              .then((r) => (r.ok ? r.json() : { events: [] }))
              .then((payload) => ({
                id: m.id,
                name: nameFromEmail(m.email),
                email: m.email,
                shareAvailability: true as const,
                allowTimeSlotRequests,
                events: (payload.events ?? []).map((e: Record<string, unknown>) => ({
                  id: String(e.id),
                  title: String(e.title ?? ""),
                  startTime: String(e.startTime ?? "00:00"),
                  endTime: String(e.endTime ?? "00:00"),
                  date: e.date ? String(e.date).split("T")[0] : "",
                  color: String(e.color ?? "bg-blue-500"),
                  day: Number(e.day ?? 0),
                  isVisible: e.isVisible !== false,
                  isTimeBlock: e.isTimeBlock === true,
                })),
              }))
          })
        ).then((list) => {
          if (!cancelled) {
            setTeammates(
              list.map(({ id, name, email, shareAvailability, allowTimeSlotRequests, events }) => ({
                id,
                name,
                email,
                shareAvailability,
                allowTimeSlotRequests,
                events,
              }))
            )
          }
        })
      })
      .catch(() => {
        if (!cancelled) setTeammates([])
      })
      .finally(() => {
        if (!cancelled) setTeammatesLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Time slot requests state
  const [timeSlotRequests, setTimeSlotRequests] = useState<
    Array<{
      id: string
      requesterId: string
      requesterName: string
      teammateId: string
      teammateName: string
      date: string
      startTime: string
      endTime: string
      title: string
      message: string
      status: "pending" | "accepted" | "rejected"
      createdAt: string
    }>
  >([])

  const handleTimeSlotRequest = async (request: {
    requesterId: string
    requesterName: string
    teammateId: string
    teammateName: string
    date: string
    startTime: string
    endTime: string
    title: string
    message: string
  }) => {
    const newRequest = {
      ...request,
      id: `req-${Date.now()}`,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    }
    setTimeSlotRequests((prev) => [...prev, newRequest])

    // Notify the calendar owner (teammate) by SMS to the phone number on file
    try {
      const res = await fetch("/api/calendar/time-slot-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teammateId: request.teammateId,
          date: request.date,
          startTime: request.startTime,
          endTime: request.endTime,
          title: request.title || undefined,
          message: request.message || undefined,
        }),
      })
      const data = await res.json()
      if (data.smsSent === false && data.error) {
        console.warn("Time slot request created; SMS not sent:", data.error)
      }
    } catch (err) {
      console.error("Failed to send time-slot notification:", err)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    const request = timeSlotRequests.find((req) => req.id === requestId)
    if (!request) return
    setTimeSlotRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: "accepted" as const } : req)),
    )
    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: request.title,
          startTime: request.startTime,
          endTime: request.endTime,
          date: request.date,
          description: request.message,
          attendees: [request.requesterName],
        }),
      })
      const data = await res.json()
      if (res.ok && data.event) {
        const ev = { ...data.event, day: new Date(data.event.date).getDay() || 7 }
        setAllEvents((prev) => [...prev, ev])
        try {
          await fetch("/api/calendar/booking-confirmation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requesterId: request.requesterId,
              title: request.title || "Meeting",
              date: request.date,
              startTime: request.startTime,
              endTime: request.endTime,
            }),
          })
        } catch {
          // Non-blocking; confirmation email best-effort
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRejectRequest = (requestId: string) => {
    setTimeSlotRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" as const } : req)),
    )
    // In a real app, you would update this on your backend
    console.log("Request rejected:", requestId)
  }

  const calculateDayFromDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.getDay() || 7 // Convert 0 (Sunday) to 7 for consistency
  }

  const handleCreateEvent = () => {
    setShowCreateEventModal(true)
    // Reset form
    const today = new Date()
    setNewEvent({
      id: Math.max(0, ...allEvents.map((e) => e.id)) + 1,
      title: "",
      startTime: "09:00",
      endTime: "10:00",
      color: "bg-blue-500",
      date: today.toISOString().split("T")[0],
      day: today.getDay() || 7,
      description: "",
      location: "",
      attendees: [],
      organizer: "You",
      isRecurring: false,
      recurrencePattern: "weekly",
      recurrenceEndDate: "",
      isVisible: true,
      isTimeBlock: false,
    })
    setAttendeeInput("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "date") {
      setNewEvent((prev) => ({
        ...prev,
        [name]: value,
        day: calculateDayFromDate(value),
      }))
    } else {
      setNewEvent((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleAddAttendee = () => {
    if (attendeeInput.trim()) {
      setNewEvent((prev) => ({
        ...prev,
        attendees: [...prev.attendees, attendeeInput.trim()],
      }))
      setAttendeeInput("")
    }
  }

  const handleRemoveAttendee = (index: number) => {
    setNewEvent((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index),
    }))
  }

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEvent.title) {
      setCalendarNoticeType("error")
      setCalendarNotice("Please enter an event title.")
      return
    }

    const eventDate = newEvent.date || new Date().toISOString().split("T")[0]

    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEvent.title,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          date: eventDate,
          description: newEvent.description || undefined,
          location: newEvent.location || undefined,
          color: newEvent.color,
          isVisible: newEvent.isVisible ?? true,
          isTimeBlock: newEvent.isTimeBlock ?? false,
          attendees: newEvent.attendees,
          clientId: eventClientId || undefined,
          attendeePhones: eventAttendeePhones
            ? eventAttendeePhones
                .split(/[\n,]+/)
                .map((p) => p.trim())
                .filter(Boolean)
            : undefined,
          recurrencePattern: newEvent.isRecurring ? newEvent.recurrencePattern : undefined,
          recurrenceEndDate: newEvent.recurrenceEndDate || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCalendarNoticeType("error")
        setCalendarNotice(data.error || "Failed to create event.")
        return
      }
      if (data.event) {
        const ev = {
          ...data.event,
          day: new Date(data.event.date).getDay() || 7,
        }
        setAllEvents((prev) => [...prev, ev])
      }
      setShowCreateEventModal(false)
      setEventClientId("")
      setEventAttendeePhones("")
      setCalendarNoticeType("success")
      setCalendarNotice("Event created successfully.")
    } catch (err) {
      console.error(err)
      setCalendarNoticeType("error")
      setCalendarNotice("Failed to create event.")
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image - covers full viewport including sidebar */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover -z-10"
        priority
      />

      {/* Portal Sidebar - transparent overlay, collapsible */}
      <div className={`fixed left-0 top-0 z-50 portal-sidebar-wrapper h-screen pointer-events-none transition-all duration-300 ease-in-out ${isCollapsed ? "w-16" : "w-56"}`}>
        <div className="pointer-events-auto w-full h-full border-r border-white/20">
          <PortalSidebar />
        </div>
      </div>

      <div className={`relative min-h-screen w-full overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? "pl-16" : "pl-64"}`}>

      {/* Navigation (sits inside main content, respects sidebar padding) */}
      <header
        className={`flex items-center justify-between pl-4 pr-8 py-4 opacity-0 ${
          isLoaded ? "animate-fade-in" : ""
        }`}
        style={{ animationDelay: "0.2s" }}
      >
        {/* Left: sidebar toggle (when collapsed) + Calendar title */}
        <div className="flex items-center gap-3">
          {isCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Expand sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <span className="text-2xl font-semibold text-white drop-shadow-lg">Calendar</span>
        </div>

        {/* Right: search + settings */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              placeholder="Search"
              className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <Settings className="h-6 w-6 text-white drop-shadow-md" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen w-full pt-2 flex">
        {/* Sidebar */}
        <div
          className={`w-64 h-full bg-black/90 backdrop-blur-xl p-4 shadow-xl border-r border-white/20 rounded-tr-3xl opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col`}
          style={{ animationDelay: "0.4s" }}
        >
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {/* Create event button */}
            <Button
              onClick={() => setShowCreateEventModal(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 shrink-0" />
              Create event
            </Button>

            {/* Mini Calendar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">
                  {currentDateState.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDateState)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setCurrentDateState(newDate)
                    }}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDateState)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setCurrentDateState(newDate)
                    }}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <div key={i} className="text-xs text-white/70 font-medium py-1">
                    {day}
                  </div>
                ))}

                {(() => {
                  const year = currentDateState.getFullYear()
                  const month = currentDateState.getMonth()
                  const firstDay = new Date(year, month, 1)
                  const lastDay = new Date(year, month + 1, 0)
                  const daysInMonth = lastDay.getDate()
                  const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
                  const days: (number | null)[] = []

                  for (let i = 0; i < startingDayOfWeek; i++) {
                    days.push(null)
                  }

                  for (let day = 1; day <= daysInMonth; day++) {
                    days.push(day)
                  }

                  return days.map((day, i) => {
                    if (day === null) {
                      return (
                        <div key={i} className="text-xs rounded-full w-7 h-7 flex items-center justify-center invisible">
                          {day}
                        </div>
                      )
                    }

                    const isToday =
                      day === new Date().getDate() &&
                      month === new Date().getMonth() &&
                      year === new Date().getFullYear()
                    const isCurrentMonth = month === currentDateState.getMonth()

                    return (
                      <div
                        key={i}
                        className={`text-xs rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-colors ${
                          isToday && isCurrentMonth
                            ? "bg-blue-500 text-white"
                            : "text-white hover:bg-white/20"
                        }`}
                        onClick={() => {
                          const newDate = new Date(year, month, day)
                          setCurrentDateState(newDate)
                          setCurrentView("day")
                        }}
                      >
                        {day}
                      </div>
                    )
                  })
                })()}
              </div>
            </div>

            {/* My Calendars */}
            <div>
              <h3 className="text-white font-medium mb-3">My calendars</h3>
              <div className="space-y-2">
                {myCalendars.map((cal, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${cal.color}`}></div>
                    <span className="text-white text-sm">{cal.name}</span>
                  </div>
                ))}
                {myCalendars.length === 0 && (
                  <p className="text-white/50 text-xs">No calendars yet</p>
                )}
              </div>
            </div>

            {/* Request Management Panel */}
            <div>
              <RequestManagementPanel
                requests={timeSlotRequests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            </div>

            {/* Teammates Calendar View */}
            <div>
              {teammatesLoading ? (
                <p className="text-white/70 text-sm">Loading teammates…</p>
              ) : (
                <TeammatesCalendarView
                  teammates={teammates.map((t) => ({
                    ...t,
                    events: t.events.map((e) => ({
                      ...e,
                      date: e.date || new Date().toISOString().split("T")[0],
                    })),
                  }))}
                  onRequestTimeSlot={handleTimeSlotRequest}
                />
              )}
            </div>
          </div>

          {/* Fixed bottom button */}
          <button
            className="mt-4 flex items-center justify-center gap-2 rounded-full bg-blue-500 p-4 text-white w-14 h-14 self-start"
            onClick={handleCreateEvent}
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Calendar View */}
        <div
          className={`flex-1 flex flex-col bg-black/70 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 bg-black/80 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateDate("today")}
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
              >
                Today
              </button>
              <div className="flex">
                <button
                  onClick={() => navigateDate("prev")}
                  className="p-2 text-white hover:bg-white/10 rounded-l-md transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigateDate("next")}
                  className="p-2 text-white hover:bg-white/10 rounded-r-md transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-white">{getDateDisplay()}</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-md p-1 bg-white/10">
                <button
                  onClick={() => setCurrentView("day")}
                  className={`px-3 py-1 rounded transition-colors ${
                    currentView === "day" ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
                  } text-sm`}
                >
                  Day
                </button>
                <button
                  onClick={() => setCurrentView("week")}
                  className={`px-3 py-1 rounded transition-colors ${
                    currentView === "week" ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
                  } text-sm`}
                >
                  Week
                </button>
                <button
                  onClick={() => setCurrentView("month")}
                  className={`px-3 py-1 rounded transition-colors ${
                    currentView === "month" ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
                  } text-sm`}
                >
                  Month
                </button>
              </div>

              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                disabled={isSyncing}
                onClick={() => setShowSyncCalendarModal(true)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                Sync Calendar
              </Button>
            </div>
          </div>

          {calendarNotice && (
            <div
              className={`mx-4 mt-2 rounded-lg border px-4 py-3 text-sm ${
                calendarNoticeType === "success"
                  ? "border-green-400/30 bg-green-500/15 text-green-100"
                  : calendarNoticeType === "error"
                    ? "border-red-400/30 bg-red-500/15 text-red-100"
                    : "border-blue-400/30 bg-blue-500/15 text-blue-100"
              }`}
            >
              {calendarNotice}
            </div>
          )}

          {/* Calendar Views */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-black/85 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl h-full">
              {currentView === "day" && (
                <>
                  {/* Day Header */}
                  <div className="grid grid-cols-2 border-b border-white/20 p-4">
                    <div className="text-center">
                      <div className="text-xs text-white/70 font-medium">
                        {currentDateState.toLocaleDateString("en-US", { weekday: "long" })}
                      </div>
                      <div className="text-2xl font-bold text-white mt-1">
                        {currentDateState.getDate()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white/70 font-medium">
                        {currentDateState.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  {/* Day Time Grid */}
                  <div className="grid grid-cols-2">
                    {/* Time Labels */}
                    <div className="text-white/70 border-r border-white/20">
                      {timeSlots.map((time, i) => (
                        <div key={i} className="h-16 border-b border-white/10 pr-2 text-right text-xs flex items-center justify-end">
                          {time === 12
                            ? "12 PM"
                            : time > 12
                              ? `${time - 12} PM`
                              : time === 0
                                ? "12 AM"
                                : `${time} AM`}
                        </div>
                      ))}
                    </div>

                    {/* Day Column */}
                    <div className="relative">
                      {timeSlots.map((_, timeIndex) => (
                        <div key={timeIndex} className="h-16 border-b border-white/10"></div>
                      ))}

                      {/* Events for this day */}
                      {allEvents
                        .filter((event) => {
                          if (!event.date) return false
                          const eventDate = new Date(event.date + "T00:00:00")
                          const currentDate = new Date(currentDateState)
                          return (
                            eventDate.getDate() === currentDate.getDate() &&
                            eventDate.getMonth() === currentDate.getMonth() &&
                            eventDate.getFullYear() === currentDate.getFullYear()
                          )
                        })
                        .map((event, i) => {
                          const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                          return (
                            <div
                              key={i}
                              className={`absolute ${event.color} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg ${event.isRecurring ? "border-l-4 border-white" : ""}`}
                              style={{
                                ...eventStyle,
                                left: "4px",
                                right: "4px",
                              }}
                              onClick={() => handleEventClick(event)}
                            >
                              <div className="font-medium">{event.title}</div>
                              <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                              {event.isTimeBlock && (
                                <div className="text-[9px] opacity-70 mt-0.5">🔒 Personal Block</div>
                              )}
                              {!event.isVisible && !event.isTimeBlock && (
                                <div className="text-[9px] opacity-70 mt-0.5">🔒 Private</div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </>
              )}

              {currentView === "week" && (
                <>
                  {/* Week Header */}
                  <div className="grid grid-cols-8 border-b border-white/20">
                    <div className="p-2 text-center text-white/50 text-xs"></div>
                    {weekDays.map((day, i) => {
                      const date = weekDates[i]
                      const isToday =
                        date.getDate() === new Date().getDate() &&
                        date.getMonth() === new Date().getMonth() &&
                        date.getFullYear() === new Date().getFullYear()
                      return (
                        <div key={i} className="p-2 text-center border-l border-white/20">
                          <div className="text-xs text-white/70 font-medium">{day}</div>
                          <div
                            className={`text-lg font-medium mt-1 text-white ${
                              isToday ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""
                            }`}
                          >
                            {date.getDate()}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Time Grid */}
                  <div className="grid grid-cols-8">
                    {/* Time Labels */}
                    <div className="text-white/70">
                      {timeSlots.map((time, i) => (
                        <div key={i} className="h-16 border-b border-white/10 pr-2 text-right text-xs flex items-center justify-end">
                          {time === 12
                            ? "12 PM"
                            : time > 12
                              ? `${time - 12} PM`
                              : time === 0
                                ? "12 AM"
                                : `${time} AM`}
                        </div>
                      ))}
                    </div>

                    {/* Days Columns */}
                    {weekDates.map((date, dayIndex) => (
                      <div key={dayIndex} className="border-l border-white/20 relative">
                        {timeSlots.map((_, timeIndex) => (
                          <div key={timeIndex} className="h-16 border-b border-white/10"></div>
                        ))}

                        {/* Events */}
                        {allEvents
                          .filter((event) => {
                            if (!event.date) return false
                            const eventDate = new Date(event.date + "T00:00:00")
                            return (
                              eventDate.getDate() === date.getDate() &&
                              eventDate.getMonth() === date.getMonth() &&
                              eventDate.getFullYear() === date.getFullYear()
                            )
                          })
                          .map((event, i) => {
                            const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                            return (
                              <div
                                key={i}
                                className={`absolute ${event.color} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg ${event.isRecurring ? "border-l-4 border-white" : ""}`}
                                style={{
                                  ...eventStyle,
                                  left: "4px",
                                  right: "4px",
                                }}
                                onClick={() => handleEventClick(event)}
                              >
                                <div className="font-medium">{event.title}</div>
                                <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                                {event.isTimeBlock && (
                                  <div className="text-[9px] opacity-70 mt-0.5">🔒 Personal Block</div>
                                )}
                                {!event.isVisible && !event.isTimeBlock && (
                                  <div className="text-[9px] opacity-70 mt-0.5">🔒 Private</div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {currentView === "month" && (
                <>
                  {/* Month Header */}
                  <div className="grid grid-cols-7 border-b border-white/20 p-2">
                    {weekDays.map((day, i) => (
                      <div key={i} className="p-2 text-center text-xs text-white/70 font-medium">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Month Grid */}
                  <div className="grid grid-cols-7">
                    {(() => {
                      const year = currentDateState.getFullYear()
                      const month = currentDateState.getMonth()
                      const firstDay = new Date(year, month, 1)
                      const lastDay = new Date(year, month + 1, 0)
                      const daysInMonth = lastDay.getDate()
                      const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // Monday = 0
                      const days: (Date | null)[] = []

                      // Add empty cells for days before the first day of the month
                      for (let i = 0; i < startingDayOfWeek; i++) {
                        days.push(null)
                      }

                      // Add all days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        days.push(new Date(year, month, day))
                      }

                      return days.map((date, index) => {
                        if (!date) {
                          return (
                            <div key={index} className="h-24 border-b border-r border-white/10 p-1"></div>
                          )
                        }

                        const isToday =
                          date.getDate() === new Date().getDate() &&
                          date.getMonth() === new Date().getMonth() &&
                          date.getFullYear() === new Date().getFullYear()

                        const dayEvents = allEvents.filter((event) => {
                          if (!event.date) return false
                          const eventDate = new Date(event.date + "T00:00:00")
                          return (
                            eventDate.getDate() === date.getDate() &&
                            eventDate.getMonth() === date.getMonth() &&
                            eventDate.getFullYear() === date.getFullYear()
                          )
                        })

                        return (
                          <div
                            key={index}
                            className={`h-24 border-b border-r border-white/10 p-1 ${
                              isToday ? "bg-blue-500/20" : ""
                            }`}
                          >
                            <div
                              className={`text-xs font-medium mb-1 ${
                                isToday ? "bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white" : "text-white"
                              }`}
                            >
                              {date.getDate()}
                            </div>
                            <div className="space-y-0.5">
                              {dayEvents.slice(0, 3).map((event, i) => (
                                <div
                                  key={i}
                                  className={`${event.color} rounded text-white text-[10px] p-0.5 truncate cursor-pointer hover:opacity-80`}
                                  onClick={() => handleEventClick(event)}
                                  title={event.title}
                                >
                                  {event.startTime} {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="text-white/70 text-[10px]">+{dayEvents.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${selectedEvent.color} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
              <h3 className="text-2xl font-bold mb-4 text-white">{selectedEvent.title}</h3>
              <div className="space-y-3 text-white">
                <p className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {`${selectedEvent.startTime} - ${selectedEvent.endTime}`}
                </p>
                <p className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {selectedEvent.location}
                </p>
                <p className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  {selectedEvent.date
                    ? new Date(selectedEvent.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : `${weekDays[selectedEvent.day - 1] || ""}, ${weekDates[selectedEvent.day - 1] || ""}`}
                </p>
                {selectedEvent && selectedEvent.isRecurring && (
                  <p className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    <span>
                      <strong>Recurs:</strong>{" "}
                      {selectedEvent.recurrencePattern.charAt(0).toUpperCase() +
                        selectedEvent.recurrencePattern.slice(1)}
                      {selectedEvent.recurrenceEndDate &&
                        ` until ${new Date(selectedEvent.recurrenceEndDate).toLocaleDateString()}`}
                    </span>
                  </p>
                )}
                <p className="flex items-start">
                  <Users className="mr-2 h-5 w-5 mt-1" />
                  <span>
                    <strong>Attendees:</strong>
                    <br />
                    {selectedEvent.attendees.join(", ") || "No attendees"}
                  </span>
                </p>
                <p>
                  <strong>Organizer:</strong> {selectedEvent.organizer}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description || "No description"}
                </p>
                {selectedEvent.isTimeBlock && (
                  <p className="flex items-center gap-2">
                    <span>🔒</span>
                    <strong>Personal Time Block</strong>
                  </p>
                )}
                {!selectedEvent.isVisible && !selectedEvent.isTimeBlock && (
                  <p className="flex items-center gap-2">
                    <span>🔒</span>
                    <strong>Private Event</strong>
                  </p>
                )}
                {selectedEvent.isVisible && !selectedEvent.isTimeBlock && (
                  <p className="flex items-center gap-2">
                    <span>👁️</span>
                    <strong>Visible to Teammates</strong>
                  </p>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Event Modal - white card, dark grey inputs for contrast */}
        {showCreateEventModal && (
          <div className={`fixed inset-0 bg-black/40 flex items-start justify-start z-50 ${isCollapsed ? "pt-24 pl-24" : "pt-24 pl-[34rem]"}`}>
            <style>{`
              .create-event-modal { background: #ffffff !important; color: #111827 !important; }
              .create-event-modal .create-event-title { color: #111827 !important; }
              .create-event-modal label { color: #1f2937 !important; }
              .create-event-modal .create-event-input,
              .create-event-modal input[type="text"],
              .create-event-modal input[type="time"],
              .create-event-modal select,
              .create-event-modal textarea { background: #374151 !important; border: 1px solid #4b5563 !important; color: #f9fafb !important; }
              .create-event-modal input::placeholder,
              .create-event-modal textarea::placeholder { color: #9ca3af !important; }
              .create-event-modal select option { background: #374151; color: #f9fafb; }
              .create-event-modal .create-event-hint { color: #4b5563 !important; }
              .create-event-modal .create-event-section { background: #f3f4f6 !important; color: #111827 !important; border-color: #d1d5db !important; }
              .create-event-modal .create-event-chip { background: #e5e7eb !important; color: #1f2937 !important; }
              .create-event-modal .create-event-chip button { color: #4b5563 !important; }
              .create-event-modal input[type="checkbox"] { accent-color: #2563eb; }
            `}</style>
            <div className="create-event-modal relative p-6 rounded-xl max-w-md w-full overflow-y-auto max-h-[90vh] shadow-2xl border border-gray-200">
              <h3 className="create-event-title text-2xl font-bold mb-4">Create New Event</h3>

              <form onSubmit={handleSubmitEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    className="create-event-input w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Event title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      value={newEvent.startTime}
                      onChange={handleInputChange}
                      className="create-event-input w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={newEvent.endTime}
                      onChange={handleInputChange}
                      className="create-event-input w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <div className="[&_button]:!bg-[#374151] [&_button]:!text-[#f9fafb] [&_button]:!border-[#4b5563] [&_button]:!border [&_svg]:!text-[#9ca3af]">
                    <DatePicker
                      value={newEvent.date}
                      onChange={(date) =>
                        setNewEvent((prev) => ({
                          ...prev,
                          date,
                          day: calculateDayFromDate(date),
                        }))
                      }
                      placeholder="Select date"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isTimeBlock"
                      checked={newEvent.isTimeBlock}
                      onChange={(e) => {
                        const isTimeBlock = e.target.checked
                        setNewEvent((prev) => ({
                          ...prev,
                          isTimeBlock,
                          isVisible: isTimeBlock ? false : prev.isVisible, // Time blocks are always private
                        }))
                      }}
                      className="mr-2 h-4 w-4 rounded border-2 border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="isTimeBlock" className="text-sm font-medium" style={{ color: "#000" }}>
                      Personal Time Block (Private)
                    </label>
                  </div>

                  {!newEvent.isTimeBlock && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isVisible"
                        checked={newEvent.isVisible}
                        onChange={(e) => setNewEvent((prev) => ({ ...prev, isVisible: e.target.checked }))}
                        className="mr-2 h-4 w-4 rounded border-2 border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                      <label htmlFor="isVisible" className="text-sm font-medium" style={{ color: "#000" }}>
                        Show to Teammates
                      </label>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={newEvent.isRecurring}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, isRecurring: e.target.checked }))}
                      className="mr-2 h-4 w-4 rounded border-2 border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium" style={{ color: "#000" }}>
                      Recurring Event
                    </label>
                  </div>
                </div>

                {newEvent.isRecurring && (
                  <div className="space-y-4 mt-4 p-4 rounded-md border-2 border-gray-500" style={{ backgroundColor: "#e5e7eb" }}>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "#000" }}>Recurrence Pattern</label>
                      <select
                        name="recurrencePattern"
                        value={newEvent.recurrencePattern}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ backgroundColor: "#4b5563", border: "2px solid #374151", color: "#fff" }}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "#000" }}>End Date (Optional)</label>
                      <div className="[&_button]:!bg-[#4b5563] [&_button]:!text-white [&_button]:!border-[#374151] [&_button]:!border-2 [&_svg]:!text-[#9ca3af]">
                        <DatePicker
                          value={newEvent.recurrenceEndDate}
                          onChange={(date) =>
                            setNewEvent((prev) => ({ ...prev, recurrenceEndDate: date }))
                          }
                          placeholder="Select end date"
                          min={newEvent.date}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={newEvent.location}
                    onChange={handleInputChange}
                    className="create-event-input w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Event location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Client (reminder)</label>
                  <select
                    value={eventClientId}
                    onChange={(e) => setEventClientId(e.target.value)}
                    className="create-event-input w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {calendarClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {[c.firstName, c.lastName].filter(Boolean).join(" ") || c.id}
                      </option>
                    ))}
                  </select>
                  <p className="create-event-hint text-xs mt-1">
                    Link a CRM client to send them an SMS reminder 24h before.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Other phones for reminders</label>
                  <textarea
                    value={eventAttendeePhones}
                    onChange={(e) => setEventAttendeePhones(e.target.value)}
                    rows={3}
                    className="create-event-input w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-[72px]"
                    placeholder="One phone per line, e.g. +15551234567"
                  />
                  <p className="create-event-hint text-xs mt-1">
                    These numbers will receive an SMS reminder 24h before the appointment.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="create-event-input w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-[96px]"
                    placeholder="Event description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Attendees</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={attendeeInput}
                      onChange={(e) => setAttendeeInput(e.target.value)}
                      className="create-event-input flex-1 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add attendee"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttendee}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
                    >
                      Add
                    </button>
                  </div>

                  {newEvent.attendees.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newEvent.attendees.map((attendee, index) => (
                        <div key={index} className="create-event-chip flex items-center rounded-full px-3 py-1 border border-gray-200">
                          <span className="text-sm font-medium">{attendee}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttendee(index)}
                            className="ml-2 hover:opacity-80 rounded p-0.5"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateEventModal(false)
                      setEventClientId("")
                      setEventAttendeePhones("")
                    }}
                    className="px-4 py-2 rounded-md font-medium bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showSyncCalendarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-[#0f1720] p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Choose a calendar to connect</h3>
                  <p className="mt-2 text-sm text-white/65">
                    Pick how you want this user&apos;s Pantheon calendar to sync. Google uses direct OAuth. Apple uses your private subscription link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSyncCalendarModal(false)}
                  className="rounded-full border border-white/15 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Close calendar sync modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-white/10 p-2">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Google Calendar</h4>
                        <p className="text-sm text-white/60">Push events directly to this user&apos;s Google Calendar.</p>
                      </div>
                    </div>
                    {googleCalendarConnected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-1 text-xs text-green-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Connected
                      </span>
                    )}
                  </div>
                  <div className="mt-5 flex gap-2">
                    {googleCalendarConnected ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDisconnectGoogle}
                        disabled={isSyncing}
                        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                      >
                        {isSyncing ? "Disconnecting..." : "Disconnect Google"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleGoogleCalendarSync}
                        disabled={isSyncing}
                        className="bg-white/10 text-white hover:bg-white/20"
                      >
                        Connect Google Calendar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white/10 p-2">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Apple Calendar</h4>
                      <p className="text-sm text-white/60">
                        Subscribe this user&apos;s calendar feed in Apple Calendar, iPhone, iPad, or any calendar app that supports subscription URLs.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={handleAppleCalendarSync}
                      disabled={isSyncing || calendarFeedLoading}
                      className="bg-white/10 text-white hover:bg-white/20"
                    >
                      {calendarFeedLoading ? "Preparing..." : "Open in Apple Calendar"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopyCalendarFeed}
                      disabled={calendarFeedLoading}
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                    {calendarFeedUrl && (
                      <a
                        href={calendarFeedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Feed
                      </a>
                    )}
                  </div>
                  {calendarFeedUrl && (
                    <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
                      <p className="mb-2 text-xs uppercase tracking-wide text-white/45">Subscription URL</p>
                      <p className="break-all text-xs text-white/75">{calendarFeedUrl}</p>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-white/45">
                    Apple Calendar uses a private subscription link instead of OAuth. Each user gets their own link.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  )
}
