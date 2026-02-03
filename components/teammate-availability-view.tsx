"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, X } from "lucide-react"
import { TimeSlotRequestModal } from "./time-slot-request-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Teammate {
  id: string
  name: string
  email: string
  events: Array<{
    id: string
    title: string
    startTime: string
    endTime: string
    date: string
    isVisible: boolean
    isTimeBlock: boolean
  }>
}

interface TeammateAvailabilityViewProps {
  teammate: Teammate | null
  isOpen: boolean
  onClose: () => void
  onRequestTimeSlot: (request: {
    requesterId: string
    requesterName: string
    teammateId: string
    teammateName: string
    date: string
    startTime: string
    endTime: string
    title: string
    message: string
  }) => void
}

export function TeammateAvailabilityView({
  teammate,
  isOpen,
  onClose,
  onRequestTimeSlot,
}: TeammateAvailabilityViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null)

  if (!teammate) return null

  // Get events for selected date (only visible ones and time blocks)
  const dayEvents = teammate.events.filter((event) => {
    if (!event.date) return false
    // Normalize dates for comparison (remove time component)
    const eventDateStr = event.date.split("T")[0]
    const selectedDateStr = selectedDate.split("T")[0]
    return eventDateStr === selectedDateStr && (event.isVisible || event.isTimeBlock)
  })

  // Generate time slots (6 AM to 10 PM)
  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6)

  // Find available time slots
  const getAvailableSlots = () => {
    const busySlots: Array<{ start: number; end: number }> = []

    dayEvents.forEach((event) => {
      const startHour = Number.parseInt(event.startTime.split(":")[0])
      const startMin = Number.parseInt(event.startTime.split(":")[1])
      const endHour = Number.parseInt(event.endTime.split(":")[0])
      const endMin = Number.parseInt(event.endTime.split(":")[1])

      busySlots.push({
        start: startHour + startMin / 60,
        end: endHour + endMin / 60,
      })
    })

    // Sort busy slots
    busySlots.sort((a, b) => a.start - b.start)

    // Find available slots between busy periods
    const available: Array<{ start: string; end: string }> = []
    let currentTime = 6 // Start at 6 AM

    busySlots.forEach((busy) => {
      if (currentTime < busy.start) {
        // There's available time before this busy slot
        const startHour = Math.floor(currentTime)
        const startMin = Math.round((currentTime - startHour) * 60)
        const endHour = Math.floor(busy.start)
        const endMin = Math.round((busy.start - endHour) * 60)

        available.push({
          start: `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`,
          end: `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
        })
      }
      currentTime = Math.max(currentTime, busy.end)
    })

    // Add remaining time after last busy slot
    if (currentTime < 22) {
      const startHour = Math.floor(currentTime)
      const startMin = Math.round((currentTime - startHour) * 60)
      available.push({
        start: `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`,
        end: "22:00",
      })
    }

    return available.filter((slot) => {
      const start = Number.parseInt(slot.start.split(":")[0]) + Number.parseInt(slot.start.split(":")[1]) / 60
      const end = Number.parseInt(slot.end.split(":")[0]) + Number.parseInt(slot.end.split(":")[1]) / 60
      return end - start >= 0.5 // At least 30 minutes
    })
  }

  const availableSlots = getAvailableSlots()

  const handleSlotClick = (slot: { start: string; end: string }) => {
    setSelectedTimeSlot(slot)
    setShowRequestModal(true)
  }

  const handleRequestSubmit = (request: {
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
    onRequestTimeSlot({
      requesterId: request.requesterId,
      requesterName: request.requesterName,
      teammateId: request.teammateId,
      teammateName: request.teammateName,
      date: selectedDate,
      startTime: selectedTimeSlot?.start || request.startTime,
      endTime: selectedTimeSlot?.end || request.endTime,
      title: request.title,
      message: request.message,
    })
    setShowRequestModal(false)
    setSelectedTimeSlot(null)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-white/20 backdrop-blur-lg border-white/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {teammate.name}'s Availability
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Date Selector */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Busy Times */}
            {dayEvents.length > 0 && (
              <div>
                <h4 className="text-white text-sm font-medium mb-2">Busy Times</h4>
                <div className="space-y-1">
                  {dayEvents.map((event, i) => (
                    <div key={i} className="bg-white/10 rounded p-2 text-white text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {event.startTime} - {event.endTime}
                        </span>
                        {event.isTimeBlock && (
                          <span className="bg-orange-500/30 px-2 py-0.5 rounded text-[10px]">Personal Block</span>
                        )}
                      </div>
                      {event.isVisible && <div className="text-white/70 mt-1">{event.title}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Time Slots */}
            <div>
              <h4 className="text-white text-sm font-medium mb-2">Available Time Slots</h4>
              {availableSlots.length === 0 ? (
                <p className="text-white/70 text-sm">No available time slots for this date</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {availableSlots.map((slot, i) => {
                    const start = Number.parseInt(slot.start.split(":")[0]) + Number.parseInt(slot.start.split(":")[1]) / 60
                    const end = Number.parseInt(slot.end.split(":")[0]) + Number.parseInt(slot.end.split(":")[1]) / 60
                    const duration = end - start

                    return (
                      <button
                        key={i}
                        onClick={() => handleSlotClick(slot)}
                        className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg p-3 text-left transition-colors"
                      >
                        <div className="text-white font-medium text-sm">
                          {slot.start} - {slot.end}
                        </div>
                        <div className="text-white/70 text-xs mt-1">
                          {duration >= 1 ? `${duration} hour${duration > 1 ? "s" : ""}` : `${Math.round(duration * 60)} minutes`}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose} className="bg-white/10 text-white border-white/30">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TimeSlotRequestModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false)
          setSelectedTimeSlot(null)
        }}
        teammate={teammate}
        onRequestSubmit={handleRequestSubmit}
        prefillTime={selectedTimeSlot || undefined}
        prefillDate={selectedDate}
      />
    </>
  )
}

