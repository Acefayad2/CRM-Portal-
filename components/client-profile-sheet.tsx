"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useContactLogs } from "@/contexts/contact-logs-context"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Phone, Mail, MessageSquare, Calendar, FileText, Upload, Download, Clock, Tag, User, Share2 } from "lucide-react"
import { type Client, statusOptions, stageOptions } from "@/lib/crm-data"

interface ClientProfileSheetProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onSendClient?: () => void
}

export function ClientProfileSheet({ client, isOpen, onClose, onSendClient }: ClientProfileSheetProps) {
  const { logContact, getLastCall, getClientContactHistory } = useContactLogs()
  const [activeTab, setActiveTab] = useState("overview")
  const [notes, setNotes] = useState(client?.notes || "")

  if (!client) return null

  const clientName = `${client.firstName} ${client.lastName}`
  const lastCalled = getLastCall(client.id)
  const contactHistoryFromLogs = getClientContactHistory(client.id)

  const handleAction = (action: string) => {
    if (action === "call" || action === "text" || action === "email") {
      logContact(client.id, clientName, action)
    }

    if (action === "call") {
      window.open(`tel:${client.phone}`)
    } else if (action === "text") {
      window.open(`sms:${client.phone}`)
    } else if (action === "email") {
      window.open(`mailto:${client.email}?subject=Pantheon%20Follow-up`)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {(client.firstName?.[0] ?? "") + (client.lastName?.[0] ?? "") || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-xl">
                {client.firstName} {client.lastName}
              </SheetTitle>
              <SheetDescription className="space-y-1">
                <div>{client.email}</div>
                <div>{client.phone}</div>
              </SheetDescription>
            </div>
          </div>

          {/* Status and Stage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue={client.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select defaultValue={client.stage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {client.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              <Button size="sm" variant="outline" className="h-6 bg-transparent">
                <Tag className="h-3 w-3 mr-1" />
                Add Tag
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => handleAction("call")}>
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAction("text")}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Text
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAction("email")}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            {onSendClient && (
              <Button size="sm" variant="outline" onClick={onSendClient}>
                <Share2 className="h-4 w-4 mr-2" />
                Share with teammate
              </Button>
            )}
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Assigned Agent</Label>
                    <p className="text-sm font-medium">{client.assignedAgent}</p>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className="text-sm text-muted-foreground">{client.createdAt}</p>
                  </div>
                  <div>
                    <Label>Last Contact</Label>
                    <p className="text-sm text-muted-foreground">{client.lastContact || "Never"}</p>
                  </div>
                  <div>
                    <Label>Last Called</Label>
                    <p className="text-sm text-muted-foreground">{lastCalled || "Never"}</p>
                  </div>
                  <div>
                    <Label>Next Appointment</Label>
                    <p className="text-sm text-muted-foreground">{client.nextAppointment || "None scheduled"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Client Notes
                </CardTitle>
                <CardDescription>Keep track of important information about this client</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this client..."
                  rows={8}
                />
                <div className="flex justify-end mt-4">
                  <Button size="sm">Save Notes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents
                  </div>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client.files.length > 0 ? (
                  <div className="space-y-3">
                    {client.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {file.type} • {file.uploadedAt}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No files uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Appointments
                  </div>
                  <Button size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments scheduled</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Contact Timeline
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client.contactHistory.length === 0 && contactHistoryFromLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No contact history recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...contactHistoryFromLogs, ...client.contactHistory]
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 20)
                      .map((contact) => (
                    <div key={contact.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                        {("action" in contact ? contact.action : contact.type) === "call" && <Phone className="h-4 w-4 text-accent" />}
                        {("action" in contact ? contact.action : contact.type) === "email" && <Mail className="h-4 w-4 text-accent" />}
                        {("action" in contact ? contact.action : contact.type) === "text" && <MessageSquare className="h-4 w-4 text-accent" />}
                        {"type" in contact && contact.type === "meeting" && <Calendar className="h-4 w-4 text-accent" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm capitalize">{("action" in contact ? contact.action : contact.type) as string}</p>
                          <p className="text-xs text-muted-foreground">{contact.timestamp}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{contact.outcome}</p>
                        {"notes" in contact && contact.notes && <p className="text-xs text-muted-foreground mt-2 italic">{contact.notes}</p>}
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
