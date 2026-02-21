"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { TimeSlotRequestModal } from "./time-slot-request-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, addDays, startOfDay, isBefore } from "date-fns"

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

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MIN_SLOT_HOURS = 0.5

function getAvailableSlotsForDay(
  dayEvents: Array<{ startTime: string; endTime: string }>
): Array<{ start: string; end: string }> {
  const busySlots: Array<{ start: number; end: number }> = dayEvents.map((event) => {
    const [sh, sm] = event.startTime.split(":").map(Number)
    const [eh, em] = event.endTime.split(":").map(Number)
    return {
      start: sh + (sm || 0) / 60,
      end: eh + (em || 0) / 60,
    }
  })
  busySlots.sort((a, b) => a.start - b.start)

  const available: Array<{ start: string; end: string }> = []
  let currentTime = 6

  busySlots.forEach((busy) => {
    if (currentTime < busy.start) {
      const startHour = Math.floor(currentTime)
      const startMin = Math.round((currentTime - startHour) * 60)
      const endHour = Math.floor(busy.start)
      const endMin = Math.round((busy.start - endHour) * 60)
      available.push({
        start: `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`,
        end: `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`,
      })
    }
    currentTime = Math.max(currentTime, busy.end)
  })

  if (currentTime < 22) {
    const startHour = Math.floor(currentTime)
    const startMin = Math.round((currentTime - startHour) * 60)
    available.push({
      start: `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`,
      end: "22:00",
    })
  }

  return available.filter((slot) => {
    const [sh, sm] = slot.start.split(":").map(Number)
    const [eh, em] = slot.end.split(":").map(Number)
    const start = sh + (sm || 0) / 60
    const end = eh + (em || 0) / 60
    return end - start >= MIN_SLOT_HOURS
  })
}

export function TeammateAvailabilityView({
  teammate,
  isOpen,
  onClose,
  onRequestTimeSlot,
}: TeammateAvailabilityViewProps) {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  })
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string
    start: string
    end: string
  } | null>(null)

  if (!teammate) return null

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const availabilityByDay = useMemo(() => {
    return weekDates.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd")
      const dayEvents = teammate.events.filter((event) => {
        if (!event.date) return false
        const eventDateStr = event.date.split("T")[0]
        return eventDateStr === dateStr && (event.isVisible || event.isTimeBlock)
      })
      const slots = getAvailableSlotsForDay(
        dayEvents.map((e) => ({ startTime: e.startTime, endTime: e.endTime }))
      )
      return { date, dateStr, slots, dayEvents }
    })
  }, [teammate.events, weekDates])

  const handleSlotClick = (dateStr: string, slot: { start: string; end: string }) => {
    setSelectedSlot({ date: dateStr, start: slot.start, end: slot.end })
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
      ...request,
      date: selectedSlot?.date ?? request.date,
      startTime: selectedSlot?.start ?? request.startTime,
      endTime: selectedSlot?.end ?? request.endTime,
    })
    setShowRequestModal(false)
    setSelectedSlot(null)
  }

  const goPrevWeek = () => setWeekStart((d) => addDays(d, -7))
  const goNextWeek = () => setWeekStart((d) => addDays(d, 7))
  const goToThisWeek = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    setWeekStart(new Date(d.setDate(diff)))
  }

  const weekLabel = `${format(weekDates[0], "MMM d")} – ${format(weekDates[6], "MMM d, yyyy")}`

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-hidden flex flex-col bg-white/20 backdrop-blur-lg border-white/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {teammate.name}'s Availability – Week View
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between gap-2 mt-2 mb-4">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={goPrevWeek}
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-white font-medium min-w-[200px] text-center text-sm">{weekLabel}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={goNextWeek}
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goToThisWeek}
              className="text-white border-white/30 hover:bg-white/10"
            >
              This week
            </Button>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0 rounded-lg border border-white/20 bg-black/20">
            <div className="grid grid-cols-7 gap-px bg-white/10">
              {WEEKDAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  className="bg-white/5 p-2 text-center text-white/80 text-xs font-medium sticky top-0 z-10"
                >
                  {label}
                  <div className="text-white/60 text-[10px] mt-0.5">
                    {format(weekDates[i], "M/d")}
                  </div>
                </div>
              ))}
              {availabilityByDay.map(({ date, dateStr, slots, dayEvents }) => (
                <div key={dateStr} className="bg-white/5 p-2 min-h-[120px]">
                  {isBefore(startOfDay(date), startOfDay(new Date())) ? (
                    <p className="text-white/50 text-xs">Past</p>
                  ) : slots.length === 0 ? (
                    <p className="text-white/50 text-xs">No slots</p>
                  ) : (
                    <div className="space-y-1">
                      {slots.map((slot, i) => {
                        const [sh, sm] = slot.start.split(":").map(Number)
                        const [eh, em] = slot.end.split(":").map(Number)
                        const duration = (eh + (em || 0) / 60) - (sh + (sm || 0) / 60)
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSlotClick(dateStr, slot)}
                            className="w-full text-left bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded px-2 py-1.5 transition-colors"
                          >
                            <div className="text-white text-xs font-medium truncate">
                              {slot.start} – {slot.end}
                            </div>
                            <div className="text-white/60 text-[10px]">
                              {duration >= 1 ? `${duration} hr` : `${Math.round(duration * 60)} min`}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/60 text-xs mt-2">
            Click an available slot to request a meeting. Busy times (events and personal blocks) are excluded.
          </p>

          <div className="flex justify-end gap-2 mt-4">
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
          setSelectedSlot(null)
        }}
        teammate={teammate}
        onRequestSubmit={handleRequestSubmit}
        prefillTime={selectedSlot ? { start: selectedSlot.start, end: selectedSlot.end } : undefined}
        prefillDate={selectedSlot?.date}
      />
    </>
  )
}

