"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Inbox } from "lucide-react"
import type { Client } from "@/lib/crm-data"
import { useClients } from "@/contexts/clients-context"

interface SharedItem {
  id: string
  client: Client
  fromEmail: string
  createdAt: string
}

export function SharedClientsList({ onClientSelect }: { onClientSelect?: (client: Client) => void }) {
  const [shared, setShared] = useState<SharedItem[]>([])
  const [loading, setLoading] = useState(true)
  const { addClient } = useClients()

  useEffect(() => {
    fetch("/api/clients/shared-with-me")
      .then((res) => res.json())
      .then((data) => setShared(data.shared ?? []))
      .catch(() => setShared([]))
      .finally(() => setLoading(false))
  }, [])

  const handleAddToMyClients = (item: SharedItem, e: React.MouseEvent) => {
    e.stopPropagation()
    const clientWithNewId = { ...item.client, id: `client-${Date.now()}` }
    addClient(clientWithNewId)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading shared clients...
        </CardContent>
      </Card>
    )
  }

  if (shared.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Shared with me
          </CardTitle>
          <CardDescription>
            Clients that teammates have shared with you will appear here
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No clients shared with you yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5" />
          Shared with me
        </CardTitle>
        <CardDescription>
          Clients your teammates have shared with you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {shared.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onClientSelect?.(item.client)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {item.client.firstName[0]}
                    {item.client.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {item.client.firstName} {item.client.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Shared by {item.fromEmail} • {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => handleAddToMyClients(item, e)}
                className="text-sm text-primary hover:underline px-2 py-1 rounded"
              >
                Add to my clients
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
