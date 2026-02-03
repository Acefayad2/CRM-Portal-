"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Calendar,
  Pause,
  Sparkles,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function CalendarView() {
  // Updated sample calendar events with all events before 4 PM
  const events = [
    {
      id: 1,
      title: "Team Meeting",
      startTime: "09:00",
      endTime: "10:00",
      color: "bg-blue-500",
      day: 1,
      description: "Weekly team sync-up",
      location: "Conference Room A",
      attendees: ["John Doe", "Jane Smith", "Bob Johnson"],
      organizer: "Alice Brown",
    },
    {
      id: 2,
      title: "Lunch with Sarah",
      startTime: "12:30",
      endTime: "13:30",
      color: "bg-green-500",
      day: 1,
      description: "Discuss project timeline",
      location: "Cafe Nero",
      attendees: ["Sarah Lee"],
      organizer: "You",
    },
    {
      id: 3,
      title: "Project Review",
      startTime: "14:00",
      endTime: "15:30",
      color: "bg-purple-500",
      day: 3,
      description: "Q2 project progress review",
      location: "Meeting Room 3",
      attendees: ["Team Alpha", "Stakeholders"],
      organizer: "Project Manager",
    },
    {
      id: 4,
      title: "Client Call",
      startTime: "10:00",
      endTime: "11:00",
      color: "bg-yellow-500",
      day: 2,
      description: "Quarterly review with major client",
      location: "Zoom Meeting",
      attendees: ["Client Team", "Sales Team"],
      organizer: "Account Manager",
    },
    {
      id: 5,
      title: "Team Brainstorm",
      startTime: "13:00",
      endTime: "14:30",
      color: "bg-indigo-500",
      day: 4,
      description: "Ideation session for new product features",
      location: "Creative Space",
      attendees: ["Product Team", "Design Team"],
      organizer: "Product Owner",
    },
    {
      id: 6,
      title: "Product Demo",
      startTime: "11:00",
      endTime: "12:00",
      color: "bg-pink-500",
      day: 5,
      description: "Showcase new features to stakeholders",
      location: "Demo Room",
      attendees: ["Stakeholders", "Dev Team"],
      organizer: "Tech Lead",
    },
    {
      id: 7,
      title: "Marketing Meeting",
      startTime: "13:00",
      endTime: "14:00",
      color: "bg-teal-500",
      day: 6,
      description: "Discuss Q3 marketing strategy",
      location: "Marketing Office",
      attendees: ["Marketing Team"],
      organizer: "Marketing Director",
    },
    {
      id: 8,
      title: "Code Review",
      startTime: "15:00",
      endTime: "16:00",
      color: "bg-cyan-500",
      day: 7,
      description: "Review pull requests for new feature",
      location: "Dev Area",
      attendees: ["Dev Team"],
      organizer: "Senior Developer",
    },
    {
      id: 9,
      title: "Morning Standup",
      startTime: "08:30",
      endTime: "09:30",
      color: "bg-blue-400",
      day: 2,
      description: "Daily team standup",
      location: "Slack Huddle",
      attendees: ["Development Team"],
      organizer: "Scrum Master",
    },
    {
      id: 10,
      title: "Design Review",
      startTime: "14:30",
      endTime: "15:45",
      color: "bg-purple-400",
      day: 5,
      description: "Review new UI designs",
      location: "Design Lab",
      attendees: ["UX Team", "Product Manager"],
      organizer: "Lead Designer",
    },
    {
      id: 11,
      title: "Investor Meeting",
      startTime: "10:30",
      endTime: "12:00",
      color: "bg-red-400",
      day: 7,
      description: "Quarterly investor update",
      location: "Board Room",
      attendees: ["Executive Team", "Investors"],
      organizer: "CEO",
    },
    {
      id: 12,
      title: "Team Training",
      startTime: "09:30",
      endTime: "11:30",
      color: "bg-green-400",
      day: 4,
      description: "New tool onboarding session",
      location: "Training Room",
      attendees: ["All Departments"],
      organizer: "HR",
    },
    {
      id: 13,
      title: "Budget Review",
      startTime: "13:30",
      endTime: "15:00",
      color: "bg-yellow-400",
      day: 3,
      description: "Quarterly budget analysis",
      location: "Finance Office",
      attendees: ["Finance Team", "Department Heads"],
      organizer: "CFO",
    },
    {
      id: 14,
      title: "Client Presentation",
      startTime: "11:00",
      endTime: "12:30",
      color: "bg-orange-400",
      day: 6,
      description: "Present new project proposal",
      location: "Client Office",
      attendees: ["Sales Team", "Client Representatives"],
      organizer: "Account Executive",
    },
    {
      id: 15,
      title: "Product Planning",
      startTime: "14:00",
      endTime: "15:30",
      color: "bg-pink-400",
      day: 1,
      description: "Roadmap discussion for Q3",
      location: "Strategy Room",
      attendees: ["Product Team", "Engineering Leads"],
      organizer: "Product Manager",
    },
  ]
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
        "Looks like you don't have that many meetings today. Shall I play some Hans Zimmer essentials to help you get into your Flow State?"
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

  const [currentView, setCurrentView] = useState("week")
  const [currentMonth, setCurrentMonth] = useState("March 2025")
  const [currentDate, setCurrentDate] = useState("March 5")
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
  }

  // Sample calendar days for the week view
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const weekDates = [3, 4, 5, 6, 7, 8, 9]
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8) // 8 AM to 4 PM

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80 // 80px per hour
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  // Sample calendar for mini calendar
  const daysInMonth = 31
  const firstDayOffset = 5 // Friday is the first day of the month in this example
  const miniCalendarDays = Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
    i < firstDayOffset ? null : i - firstDayOffset + 1,
  )

  // Sample my calendars
  const myCalendars = [
    { name: "My Calendar", color: "bg-blue-500" },
    { name: "Work", color: "bg-green-500" },
    { name: "Personal", color: "bg-purple-500" },
    { name: "Family", color: "bg-orange-500" },
  ]

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
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

    // Add new event to events array
    setAllEvents((prev) => [...prev, newEvent as any])

    // Close modal
    setShowCreateEventModal(false)
  }

  return (
    <div className="relative min-h-[calc(100vh-200px)] w-full overflow-hidden rounded-lg">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
          alt="Beautiful mountain landscape"
          fill
          className="object-cover rounded-lg"
          priority
        />
      </div>

      {/* Main Content */}
      <main className="relative h-full w-full pt-6 flex">
        {/* Sidebar */}
        <div
          className={`w-64 h-full bg-white/10 backdrop-blur-lg p-4 shadow-xl border-r border-white/20 rounded-l-lg opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col justify-between`}
          style={{ animationDelay: "0.2s" }}
        >
          <div>
            <Button
              className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full hover:bg-blue-600"
              onClick={handleCreateEvent}
            >
              <Plus className="h-5 w-5" />
              <span>Create</span>
            </Button>

            {/* Mini Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{currentMonth}</h3>
                <div className="flex gap-1">
                  <button className="p-1 rounded-full hover:bg-white/20">
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                  <button className="p-1 rounded-full hover:bg-white/20">
                    <ChevronRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-xs text-white/70 font-medium py-1">
                    {day}
                  </div>
                ))}

                {miniCalendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                      day === 5 ? "bg-blue-500 text-white" : "text-white hover:bg-white/20"
                    } ${!day ? "invisible" : ""}`}
                  >
                    {day}
                  </div>
                ))}
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
              </div>
            </div>
          </div>

          {/* Big plus button */}
          <Button
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 p-4 text-white w-14 h-14 self-start hover:bg-blue-600"
            onClick={handleCreateEvent}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Calendar View */}
        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.4s" }}
        >
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-4">
              <Button className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">Today</Button>
              <div className="flex">
                <Button variant="ghost" className="p-2 text-white hover:bg-white/10 rounded-l-md">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" className="p-2 text-white hover:bg-white/10 rounded-r-md">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold text-white">{currentDate}</h2>
            </div>

            <div className="flex items-center gap-2 rounded-md p-1 bg-white/10">
              <button
                onClick={() => setCurrentView("day")}
                className={`px-3 py-1 rounded ${currentView === "day" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Day
              </button>
              <button
                onClick={() => setCurrentView("week")}
                className={`px-3 py-1 rounded ${currentView === "week" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView("month")}
                className={`px-3 py-1 rounded ${currentView === "month" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Week View */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl h-full">
              {/* Week Header */}
              <div className="grid grid-cols-8 border-b border-white/20">
                <div className="p-2 text-center text-white/50 text-xs"></div>
                {weekDays.map((day, i) => (
                  <div key={i} className="p-2 text-center border-l border-white/20">
                    <div className="text-xs text-white/70 font-medium">{day}</div>
                    <div
                      className={`text-lg font-medium mt-1 text-white ${weekDates[i] === 5 ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}
                    >
                      {weekDates[i]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-8">
                {/* Time Labels */}
                <div className="text-white/70">
                  {timeSlots.map((time, i) => (
                    <div key={i} className="h-20 border-b border-white/10 pr-2 text-right text-xs">
                      {time > 12 ? `${time - 12} PM` : `${time} AM`}
                    </div>
                  ))}
                </div>

                {/* Days Columns */}
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className="border-l border-white/20 relative">
                    {timeSlots.map((_, timeIndex) => (
                      <div key={timeIndex} className="h-20 border-b border-white/10"></div>
                    ))}

                    {/* Events */}
                    {allEvents
                      .filter((event) => {
                        if (!event.isRecurring) {
                          return event.day === dayIndex + 1
                        }
                        return event.day === dayIndex + 1
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
                          </div>
                        )
                      })}
                  </div>
                ))}
              </div>
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

        {/* Event Details Modal */}
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
                  {`${weekDays[selectedEvent.day - 1]}, ${weekDates[selectedEvent.day - 1]} ${currentMonth}`}
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
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  variant="secondary"
                  className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
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

                <div className="mt-4">
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddAttendee()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddAttendee}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </Button>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateEventModal(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Create Event
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
