"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Teammate {
  id: string
  name: string
  email: string
  avatar?: string
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

interface TimeSlotRequestModalProps {
  isOpen: boolean
  onClose: () => void
  teammate: Teammate | null
  onRequestSubmit: (request: Omit<TimeSlotRequest, "id" | "status" | "createdAt">) => void
  prefillTime?: { start: string; end: string }
  prefillDate?: string
}

export function TimeSlotRequestModal({
  isOpen,
  onClose,
  teammate,
  onRequestSubmit,
  prefillTime,
  prefillDate,
}: TimeSlotRequestModalProps) {
  const [formData, setFormData] = useState({
    date: prefillDate || "",
    startTime: prefillTime?.start || "09:00",
    endTime: prefillTime?.end || "10:00",
    title: "",
    message: "",
  })

  // Update form when prefill props change
  useEffect(() => {
    if (prefillTime) {
      setFormData((prev) => ({
        ...prev,
        startTime: prefillTime.start,
        endTime: prefillTime.end,
      }))
    }
    if (prefillDate) {
      setFormData((prev) => ({
        ...prev,
        date: prefillDate,
      }))
    }
  }, [prefillTime, prefillDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!teammate) return

    onRequestSubmit({
      requesterId: "current-user", // In a real app, this would come from auth
      requesterName: "You", // In a real app, this would come from auth
      teammateId: teammate.id,
      teammateName: teammate.name,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      title: formData.title || `Meeting with ${teammate.name}`,
      message: formData.message,
    })

    // Reset form
    setFormData({
      date: "",
      startTime: "09:00",
      endTime: "10:00",
      title: "",
      message: "",
    })
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Request Time Slot
          </DialogTitle>
          <DialogDescription>
            {teammate ? `Request a time slot on ${teammate.name}'s calendar` : "Select a teammate first"}
          </DialogDescription>
        </DialogHeader>

        {teammate && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {teammate.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{teammate.name}</p>
                <p className="text-sm text-muted-foreground">{teammate.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Project Discussion, 1-on-1, Team Sync"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Add a message to explain the purpose of this meeting..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Send Request</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface RequestManagementPanelProps {
  requests: TimeSlotRequest[]
  onAccept: (requestId: string) => void
  onReject: (requestId: string) => void
}

export function RequestManagementPanel({ requests, onAccept, onReject }: RequestManagementPanelProps) {
  const pendingRequests = requests.filter((r) => r.status === "pending")

  if (pendingRequests.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Time Slot Requests</h3>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
          {pendingRequests.length}
        </Badge>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {pendingRequests.map((request) => (
          <div key={request.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{request.requesterName}</p>
                <p className="text-white/70 text-xs">{request.title}</p>
              </div>
            </div>
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(request.date).toLocaleDateString()} • {request.startTime} - {request.endTime}
                </span>
              </div>
              {request.message && (
                <div className="flex items-start gap-2 text-white/70 text-xs">
                  <MessageSquare className="h-3 w-3 mt-0.5" />
                  <span>{request.message}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs"
                onClick={() => onAccept(request.id)}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-white/10 text-white hover:bg-white/20 text-xs border-white/20"
                onClick={() => onReject(request.id)}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

