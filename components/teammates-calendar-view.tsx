"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TimeSlotRequestModal } from "./time-slot-request-modal"
import { TeammateAvailabilityView } from "./teammate-availability-view"

interface Teammate {
  id: string
  name: string
  email: string
  avatar?: string
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
}

interface TimeSlotRequest {
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
}

interface TeammatesCalendarViewProps {
  teammates: Teammate[]
  onRequestTimeSlot: (request: Omit<TimeSlotRequest, "id" | "status" | "createdAt">) => void
}

export function TeammatesCalendarView({ teammates, onRequestTimeSlot }: TeammatesCalendarViewProps) {
  const [selectedTeammate, setSelectedTeammate] = useState<Teammate | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showAvailabilityView, setShowAvailabilityView] = useState(false)
  const [availabilityTeammate, setAvailabilityTeammate] = useState<Teammate | null>(null)

  const handleNameClick = (teammate: Teammate) => {
    setAvailabilityTeammate(teammate)
    setShowAvailabilityView(true)
  }

  const handleRequestClick = (teammate: Teammate) => {
    setSelectedTeammate(teammate)
    setShowRequestModal(true)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-white font-medium">Teammates' Calendars</h3>

      <div className="space-y-2">
        {teammates.map((teammate) => (
          <div key={teammate.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
            <button
              onClick={() => handleNameClick(teammate)}
              className="text-white text-sm hover:text-blue-300 transition-colors cursor-pointer flex-1 text-left"
            >
              {teammate.name}
            </button>
            <Button
              size="sm"
              variant="outline"
              className="bg-blue-500 hover:bg-blue-600 text-white border-0 text-xs px-3 py-1 h-7"
              onClick={() => handleRequestClick(teammate)}
            >
              Request
            </Button>
          </div>
        ))}
      </div>

      <TimeSlotRequestModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false)
          setSelectedTeammate(null)
        }}
        teammate={selectedTeammate}
        onRequestSubmit={onRequestTimeSlot}
      />

      <TeammateAvailabilityView
        teammate={availabilityTeammate}
        isOpen={showAvailabilityView}
        onClose={() => {
          setShowAvailabilityView(false)
          setAvailabilityTeammate(null)
        }}
        onRequestTimeSlot={onRequestTimeSlot}
      />
    </div>
  )
}

