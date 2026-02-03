"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { PortalSidebar } from "@/components/portal-sidebar"
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
  Pause,
  Sparkles,
  X,
  UserPlus,
} from "lucide-react"
import { TeammatesCalendarView } from "@/components/teammates-calendar-view"
import { RequestManagementPanel } from "@/components/time-slot-request-modal"

export default function CalendarsPage() {
  // Calendar events - empty by default, user will add their own
  const events: any[] = []
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
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
  const [allEvents, setAllEvents] = useState(events)
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

    // Show AI popup after 3 seconds
    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
    }, 3000)

    return () => clearTimeout(popupTimer)
  }, [])

  useEffect(() => {
    if (showAIPopup) {
      const text =
        "LLooks like you don't have that many meetings today. Shall I play some Hans Zimmer essentials to help you get into your Flow State?"
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup])

  const [currentView, setCurrentView] = useState<"day" | "week" | "month">("week")
  const [currentDateState, setCurrentDateState] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
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
      return currentDateState.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    } else if (currentView === "week") {
      const weekStart = getStartOfWeek(currentDateState)
      const weekEnd = getEndOfWeek(currentDateState)
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`
      } else {
        return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      }
    } else {
      return currentDateState.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    }
  }

  // Calendar days for the week view
  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  const weekDates = getWeekDates(currentDateState)
  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6) // 6 AM to 10 PM

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 6) * 64 // 64px per hour (h-16 = 64px), starting from 6 AM
    const height = (end - start) * 64
    return { top: `${top}px`, height: `${height}px` }
  }


  // User calendars - empty by default
  const myCalendars: Array<{ name: string; color: string }> = []

  // Sample teammates data
  const [teammates] = useState([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      events: [
        {
          id: "1",
          title: "Team Standup",
          startTime: "09:00",
          endTime: "09:30",
          date: new Date().toISOString().split("T")[0],
          color: "bg-blue-500",
          day: 1,
          isVisible: true,
          isTimeBlock: false,
        },
        {
          id: "2",
          title: "Client Meeting",
          startTime: "14:00",
          endTime: "15:00",
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          color: "bg-green-500",
          day: 2,
          isVisible: true,
          isTimeBlock: false,
        },
        {
          id: "3",
          title: "Focus Time",
          startTime: "10:00",
          endTime: "11:00",
          date: new Date().toISOString().split("T")[0],
          color: "bg-gray-500",
          day: 1,
          isVisible: false,
          isTimeBlock: true,
        },
      ],
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael.c@company.com",
      events: [
        {
          id: "1",
          title: "Sprint Planning",
          startTime: "10:00",
          endTime: "11:30",
          date: new Date().toISOString().split("T")[0],
          color: "bg-indigo-500",
          day: 1,
          isVisible: true,
          isTimeBlock: false,
        },
        {
          id: "2",
          title: "Design Review",
          startTime: "13:00",
          endTime: "14:00",
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          color: "bg-pink-500",
          day: 4,
          isVisible: true,
          isTimeBlock: false,
        },
      ],
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      email: "emily.r@company.com",
      events: [
        {
          id: "1",
          title: "Product Demo",
          startTime: "09:00",
          endTime: "10:00",
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          color: "bg-yellow-500",
          day: 2,
          isVisible: true,
          isTimeBlock: false,
        },
        {
          id: "2",
          title: "Team Lunch",
          startTime: "12:00",
          endTime: "13:00",
          date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          color: "bg-orange-500",
          day: 5,
          isVisible: true,
          isTimeBlock: false,
        },
      ],
    },
  ])

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

  const handleTimeSlotRequest = (request: {
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
    // In a real app, you would send this to your backend
    console.log("Time slot request created:", newRequest)
  }

  const handleAcceptRequest = (requestId: string) => {
    const request = timeSlotRequests.find((req) => req.id === requestId)
    if (request) {
      // Update request status
      setTimeSlotRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: "accepted" as const } : req)),
      )

      // Create event from accepted request
      const eventDate = new Date(request.date)
      const newEventFromRequest = {
        id: Math.max(0, ...allEvents.map((e) => e.id || 0)) + 1,
        title: request.title,
        startTime: request.startTime,
        endTime: request.endTime,
        color: "bg-blue-500",
        date: request.date,
        day: eventDate.getDay() || 7,
        description: request.message,
        location: "",
        attendees: [request.requesterName],
        organizer: "You",
        isRecurring: false,
        recurrencePattern: "weekly",
        recurrenceEndDate: "",
        isVisible: true,
        isTimeBlock: false,
      }

      setAllEvents((prev) => [...prev, newEventFromRequest as any])
    }
  }

  const handleRejectRequest = (requestId: string) => {
    setTimeSlotRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" as const } : req)),
    )
    // In a real app, you would update this on your backend
    console.log("Request rejected:", requestId)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // Here you would typically also control the actual audio playback
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

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!newEvent.title) {
      alert("Please enter an event title")
      return
    }

    // Ensure date is set
    const eventDate = newEvent.date || new Date().toISOString().split("T")[0]
    
    // Create complete event object
    const completeEvent = {
      ...newEvent,
      id: Math.max(0, ...allEvents.map((e) => e.id || 0)) + 1,
      date: eventDate,
      day: calculateDayFromDate(eventDate),
      isVisible: newEvent.isVisible ?? true,
      isTimeBlock: newEvent.isTimeBlock ?? false,
    }

    // Add new event to events array
    setAllEvents((prev) => [...prev, completeEvent as any])

    // Close modal
    setShowCreateEventModal(false)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Portal Sidebar - Static overlay with matching background */}
      <div className="fixed left-0 top-0 z-50 portal-sidebar-wrapper">
        <div className="relative w-64 h-screen">
          {/* Background image overlay for sidebar */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          {/* Sidebar with transparent backdrop blur */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-md border-r border-white/20">
            <PortalSidebar />
          </div>
        </div>
      </div>

      <div className="relative min-h-screen w-full overflow-hidden pl-64">
        {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover -z-10"
        priority
      />

      {/* Navigation */}
      <header
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4">
          <Menu className="h-6 w-6 text-white" />
          <span className="text-2xl font-semibold text-white drop-shadow-lg">Calendar</span>
        </div>

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
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
            U
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen w-full pt-20 flex">
        {/* Sidebar */}
        <div
          className={`w-64 h-full bg-white/10 backdrop-blur-lg p-4 shadow-xl border-r border-white/20 rounded-tr-3xl opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col`}
          style={{ animationDelay: "0.4s" }}
        >
          <button
            className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full"
            onClick={handleCreateEvent}
          >
            <Plus className="h-5 w-5" />
            <span>Create</span>
          </button>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
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
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
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
          </div>

          {/* Calendar Views */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl h-full">
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

        {/* AI Popup */}
        {showAIPopup && (
          <div className="fixed bottom-8 right-8 z-20">
            <div className="w-[450px] relative bg-gradient-to-br from-blue-400/30 via-blue-500/30 to-blue-600/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-blue-300/30 text-white">
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-300" />
                </div>
                <div className="min-h-[80px]">
                  <p className="text-base font-light">{typedText}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={togglePlay}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowAIPopup(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  No
                </button>
              </div>
              {isPlaying && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-white text-sm hover:bg-white/20 transition-colors"
                    onClick={togglePlay}
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause Hans Zimmer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Create Event Modal */}
        {showCreateEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white/20 backdrop-blur-lg p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border border-white/30">
              <h3 className="text-2xl font-bold mb-4 text-white">Create New Event</h3>

              <form onSubmit={handleSubmitEvent} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Event title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      value={newEvent.startTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-1">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={newEvent.endTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={newEvent.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                      className="mr-2 h-4 w-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="isTimeBlock" className="text-white text-sm font-medium">
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
                        className="mr-2 h-4 w-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                      />
                      <label htmlFor="isVisible" className="text-white text-sm font-medium">
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
                      className="mr-2 h-4 w-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="isRecurring" className="text-white text-sm font-medium">
                      Recurring Event
                    </label>
                  </div>
                </div>

                {newEvent.isRecurring && (
                  <div className="space-y-4 mt-4 p-4 bg-white/5 rounded-md border border-white/10">
                    <div>
                      <label className="block text-white text-sm font-medium mb-1">Recurrence Pattern</label>
                      <select
                        name="recurrencePattern"
                        value={newEvent.recurrencePattern}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-1">End Date (Optional)</label>
                      <input
                        type="date"
                        name="recurrenceEndDate"
                        value={newEvent.recurrenceEndDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-white text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={newEvent.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Event location"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    placeholder="Event description"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-1">Attendees</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={attendeeInput}
                      onChange={(e) => setAttendeeInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add attendee"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttendee}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {newEvent.attendees.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newEvent.attendees.map((attendee, index) => (
                        <div key={index} className="flex items-center bg-white/10 rounded-full px-3 py-1">
                          <span className="text-white text-sm">{attendee}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttendee(index)}
                            className="ml-2 text-white/70 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateEventModal(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  )
}
