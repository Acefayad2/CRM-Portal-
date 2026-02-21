"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useContactLogs } from "@/contexts/contact-logs-context"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Phone, Mail, MessageSquare, MoreHorizontal, Search, Filter, Users, Share2 } from "lucide-react"
import { statusOptions, type Client } from "@/lib/crm-data"
import { useClients } from "@/contexts/clients-context"

interface ClientsListViewProps {
  onClientSelect: (client: Client) => void
  onSendClient?: (client: Client) => void
}

export function ClientsListView({ onClientSelect, onSendClient }: ClientsListViewProps) {
  const { logContact, getLastContact, getLastCall } = useContactLogs()
  const { clients, setClients, updateClient } = useClients()
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [sortField, setSortField] = useState<keyof Client>("lastName")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleAction = (action: string, client: Client) => {
    const clientName = `${client.firstName} ${client.lastName}`

    // Log contact (persists to localStorage, shows on dashboard & client profile)
    if (action === "call" || action === "text" || action === "email") {
      logContact(client.id, clientName, action)
    }

    // Update client (persists to Supabase or localStorage)
    const newContactLog = {
      id: `c${Date.now()}`,
      type: action as "call" | "text" | "email",
      timestamp: new Date().toLocaleString(),
      agent: "John Doe",
      outcome: `${action} initiated`,
      notes: `${action} action performed from client list`,
    }
    const updatedHistory = [newContactLog, ...client.contactHistory]
    const lastContactIso = new Date().toISOString()
    updateClient(client.id, {
      contactHistory: updatedHistory,
      lastContact: lastContactIso,
    })

    // Perform the actual action
    if (action === "call") {
      window.open(`tel:${client.phone}`)
    } else if (action === "text") {
      window.open(`sms:${client.phone}`)
    } else if (action === "email") {
      window.open(`mailto:${client.email}?subject=Pantheon%20Follow-up`)
    }
  }

  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSelectClient = (clientId: string) => {
    setSelectedClients((prev) => (prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]))
  }

  const handleSelectAll = () => {
    setSelectedClients(selectedClients.length === filteredClients.length ? [] : filteredClients.map((c) => c.id))
  }

  const filteredClients = clients
    .filter((client) => {
      const matchesSearch =
        searchTerm === "" ||
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)

      const matchesStatus = statusFilter === "All" || client.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "New Lead": "bg-blue-500",
      Working: "bg-yellow-500",
      "Presentation Set": "bg-purple-500",
      "Follow-Up": "bg-orange-500",
      Lost: "bg-red-500",
      "Do Not Contact": "bg-gray-500",
    }
    return colors[status] || "bg-gray-500"
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              // TODO: Open filters panel
              console.log("Filters clicked")
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              // TODO: Open import dialog
              console.log("Import clicked")
            }}
          >
            Import
          </Button>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "All" ? "default" : "outline"}
          size="sm"
          className={
            statusFilter === "All"
              ? "bg-primary text-primary-foreground"
              : "text-foreground border-border hover:bg-accent hover:text-accent-foreground"
          }
          onClick={() => setStatusFilter("All")}
        >
          All ({clients.length})
        </Button>
        {statusOptions.map((status) => {
          const count = clients.filter((c) => c.status === status).length
          return (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              className={
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground border-border hover:bg-accent hover:text-accent-foreground"
              }
              onClick={() => setStatusFilter(status)}
            >
              {status} ({count})
            </Button>
          )
        })}
      </div>

      {/* Bulk Actions */}
      {selectedClients.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
          <span className="text-sm font-medium">{selectedClients.length} selected</span>
          <Button
            size="sm"
            variant="outline"
            className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              // TODO: Open bulk tag dialog
              console.log("Bulk tag clicked for:", selectedClients)
            }}
          >
            Bulk Tag
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              // TODO: Open status update dialog
              console.log("Update status clicked for:", selectedClients)
            }}
          >
            Update Status
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("lastName")}>
                Name
              </TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Appt</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead>Last Called</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No clients found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== "All"
                        ? "Try adjusting your filters or search terms"
                        : "Get started by adding your first client"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
              <TableRow
                key={client.id}
                className="group hover:bg-muted/30 cursor-pointer"
                onClick={() => onClientSelect(client)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={() => handleSelectClient(client.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {(client.firstName?.[0] ?? "") + (client.lastName?.[0] ?? "") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {client.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(client.status)}`}></div>
                    <span className="text-sm">{client.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{client.nextAppointment || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{getLastContact(client.id) || client.lastContact || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{getLastCall(client.id) || "—"}</TableCell>
                <TableCell className="text-sm">{client.assignedAgent}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleAction("call", client)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleAction("text", client)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleAction("email", client)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    {onSendClient && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => onSendClient(client)}
                        title="Share with teammate"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onSendClient && (
                          <DropdownMenuItem onClick={() => onSendClient(client)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share with teammate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Edit Client</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                        <DropdownMenuItem>Upload File</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
