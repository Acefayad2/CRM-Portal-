"use client"

import { useState } from "react"
import { PortalLayout } from "@/components/portal-layout"
import { ClientsListView } from "@/components/clients-list-view"
import { ClientsBoardView } from "@/components/clients-board-view"
import { ClientProfileSheet } from "@/components/client-profile-sheet"
import { AddClientDialog } from "@/components/add-client-dialog"
import { SendClientDialog } from "@/components/send-client-dialog"
import { SharedClientsList } from "@/components/shared-clients-list"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, List, LayoutGrid } from "lucide-react"
import type { Client } from "@/lib/crm-data"
import { useClients } from "@/contexts/clients-context"

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "board" | "shared">("list")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [clientToSend, setClientToSend] = useState<Client | null>(null)
  const { addClient } = useClients()

  const handleOpenSend = (client: Client) => {
    setClientToSend(client)
    setSendDialogOpen(true)
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Clients</h1>
            <p className="text-muted-foreground">
              Manage your client relationships and pipeline. Share contacts with team members via the Share button or the Shared with me tab.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "board" | "shared")} className="w-full sm:w-auto">
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4 shrink-0" />
                  <span>List</span>
                </TabsTrigger>
                <TabsTrigger value="board" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 shrink-0" />
                  <span>Board</span>
                </TabsTrigger>
                <TabsTrigger value="shared" className="flex items-center gap-2">
                  <span>Shared with me</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              className="w-full shrink-0 bg-blue-500 hover:bg-blue-600 text-white sm:w-auto"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "board" | "shared")}>
          <TabsContent value="list">
            <ClientsListView onClientSelect={setSelectedClient} onSendClient={handleOpenSend} />
          </TabsContent>
          <TabsContent value="board">
            <ClientsBoardView onClientSelect={setSelectedClient} onSendClient={handleOpenSend} />
          </TabsContent>
          <TabsContent value="shared">
            <SharedClientsList onClientSelect={setSelectedClient} />
          </TabsContent>
        </Tabs>

        <ClientProfileSheet
          client={selectedClient}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          onSendClient={selectedClient ? () => handleOpenSend(selectedClient) : undefined}
        />
        <AddClientDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onAddClient={addClient}
        />
        <SendClientDialog
          open={sendDialogOpen}
          onOpenChange={(open) => {
            setSendDialogOpen(open)
            if (!open) setClientToSend(null)
          }}
          client={clientToSend}
        />
      </div>
    </PortalLayout>
  )
}
