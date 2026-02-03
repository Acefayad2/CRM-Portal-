"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MessageSquare, Calendar } from "lucide-react"
import { mockClients, statusOptions, type Client, type ClientStatus } from "@/lib/crm-data"

interface ClientsBoardViewProps {
  onClientSelect: (client: Client) => void
}

export function ClientsBoardView({ onClientSelect }: ClientsBoardViewProps) {
  const [clients, setClients] = useState(mockClients)

  const handleStatusChange = (clientId: string, newStatus: ClientStatus) => {
    setClients((prev) => prev.map((client) => (client.id === clientId ? { ...client, status: newStatus } : client)))

    // Here you would typically send the update to your backend
    console.log(`Client ${clientId} moved to ${newStatus}`)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "New Lead": "border-blue-200 bg-blue-50",
      Working: "border-yellow-200 bg-yellow-50",
      "Presentation Set": "border-purple-200 bg-purple-50",
      "Follow-Up": "border-orange-200 bg-orange-50",
      "App Submitted": "border-indigo-200 bg-indigo-50",
      "In Force": "border-green-200 bg-green-50",
      Lost: "border-red-200 bg-red-50",
      "Do Not Contact": "border-gray-200 bg-gray-50",
    }
    return colors[status] || "border-gray-200 bg-gray-50"
  }

  const getClientsByStatus = (status: ClientStatus) => {
    return clients.filter((client) => client.status === status)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusOptions.map((status) => {
        const statusClients = getClientsByStatus(status)
        return (
          <div key={status} className="flex-shrink-0 w-80">
            <Card className={`h-full ${getStatusColor(status)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {status}
                  <Badge variant="secondary" className="ml-2">
                    {statusClients.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusClients.map((client) => (
                  <Card
                    key={client.id}
                    className="p-3 bg-background border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onClientSelect(client)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {client.firstName[0]}
                            {client.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {client.firstName} {client.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {client.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {client.nextAppointment && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{client.nextAppointment}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-xs text-muted-foreground">{client.assignedAgent}</span>
                      </div>
                    </div>
                  </Card>
                ))}

                {statusClients.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No clients in this stage</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
