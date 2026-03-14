"use client"

import { useState, useEffect, useCallback } from "react"
import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScriptCard } from "@/components/script-card"
import { ScriptViewerSheet } from "@/components/script-viewer-sheet"
import { AddScriptDialog } from "@/components/add-script-dialog"
import { SendScriptToClientsDialog } from "@/components/send-script-to-clients-dialog"
import {
  Search,
  Plus,
  Filter,
  FileText,
  Presentation,
  Phone,
  Users,
  Mail,
  MessageSquare,
  RotateCcw,
} from "lucide-react"
import { scriptCategories, type Script } from "@/lib/scripts-data"

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [pageInfo, setPageInfo] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [editingScript, setEditingScript] = useState<Script | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [sendToClientsOpen, setSendToClientsOpen] = useState(false)

  const fetchScripts = useCallback(async () => {
    try {
      const res = await fetch("/api/scripts")
      if (res.ok) {
        const { scripts: data } = await res.json()
        setPageError(null)
        setPageInfo(null)
        if (Array.isArray(data)) setScripts(data)
        return
      }
      const data = await res.json().catch(() => ({}))
      setScripts([])
      if (res.status === 401) {
        setPageInfo("Sign in to access your script library.")
        setPageError(null)
        return
      }
      if (typeof data.error === "string") {
        setPageError(data.error)
      } else {
        setPageError("Failed to load scripts.")
      }
      setPageInfo(null)
    } catch {
      setScripts([])
      setPageInfo(null)
      setPageError("Network error while loading scripts.")
    }
  }, [])

  useEffect(() => {
    let mounted = true
    fetchScripts().then(() => mounted && setIsLoading(false))
    return () => { mounted = false }
  }, [fetchScripts])

  const handleAddScript = async (script: Script) => {
    setPageError(null)
    if (editingScript) {
      try {
        const res = await fetch(`/api/scripts/${editingScript.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: script.title,
            category: script.category,
            content: script.content,
            tags: script.tags,
          }),
        })
        if (res.ok) {
          const { script: updated } = await res.json()
          setScripts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
          setSelectedScript((prev) => (prev?.id === updated.id ? updated : prev))
          setEditingScript(null)
          return
        }
        const data = await res.json().catch(() => ({}))
        setPageError(data?.error ?? "Failed to update script.")
        return
      } catch {
        setPageError("Network error while updating script.")
        return
      }
    }

    try {
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: script.title,
          category: script.category,
          content: script.content,
          tags: script.tags,
          author: script.author,
          isTemplate: script.isTemplate,
          usageCount: script.usageCount ?? 0,
        }),
      })
      if (res.ok) {
        const { script: created } = await res.json()
        setScripts((prev) => [created, ...prev])
        return
      }
      const data = await res.json().catch(() => ({}))
      setPageError(data?.error ?? "Failed to create script.")
    } catch {
      setPageError("Network error while creating script.")
    }
  }

  const categoryIcons = {
    presentation: Presentation,
    "cold-call": Phone,
    recruiting: Users,
    email: Mail,
    "objection-handling": MessageSquare,
    "follow-up": RotateCcw,
  }

  const filteredScripts = scripts.filter((script) => {
    const matchesSearch =
      script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || script.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleViewScript = (script: Script) => {
    setSelectedScript(script)
    setViewerOpen(true)
  }

  const handleEditScript = (script: Script) => {
    setEditingScript(script)
    setAddDialogOpen(true)
  }

  const incrementUsage = useCallback(async (script: Script) => {
    try {
      const res = await fetch(`/api/scripts/${script.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incrementUsage: true }),
      })
      if (res.ok) {
        const { script: updated } = await res.json()
        setScripts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        setSelectedScript((prev) => (prev?.id === updated.id ? updated : prev))
        return
      }
    } catch {}
  }, [])

  const handleCopyScript = async (script: Script) => {
    await navigator.clipboard.writeText(script.content)
    void incrementUsage(script)
  }

  const handleDeleteScript = async (script: Script) => {
    const confirmed = window.confirm(`Delete "${script.title}"?`)
    if (!confirmed) return

    setPageError(null)
    try {
      const res = await fetch(`/api/scripts/${script.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setPageError(data?.error ?? "Failed to delete script.")
        return
      }
      setScripts((prev) => prev.filter((item) => item.id !== script.id))
      setSelectedScript((prev) => (prev?.id === script.id ? null : prev))
      if (selectedScript?.id === script.id) setViewerOpen(false)
    } catch {
      setPageError("Network error while deleting script.")
    }
  }

  return (
    <PortalLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Scripts Library</h1>
            <p className="text-muted-foreground">Access proven scripts for presentations, calls, and communications</p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New Script
          </Button>
        </div>

        {pageError && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {pageError}
          </div>
        )}

        {pageInfo && (
          <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
            {pageInfo}
          </div>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search scripts, tags, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                >
                  <Filter className="h-4 w-4" />
                  Clear
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Scripts ({scripts.length})
                </Badge>
                {scriptCategories.map((category) => {
                  const count = scripts.filter((s) => s.category === category.id).length
                  const Icon = categoryIcons[category.id as keyof typeof categoryIcons]
                  return (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      className="cursor-pointer flex items-center gap-1"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <Icon className="h-3 w-3" />
                      {category.name} ({count})
                    </Badge>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Overview */}
        <Tabs value={selectedCategory === "all" ? "overview" : "scripts"} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Category Overview</TabsTrigger>
            <TabsTrigger value="scripts">Scripts ({filteredScripts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {scriptCategories.map((category) => {
                const Icon = categoryIcons[category.id as keyof typeof categoryIcons]
                const count = scripts.filter((s) => s.category === category.id).length
                const totalUsage = scripts
                  .filter((s) => s.category === category.id)
                  .reduce((sum, s) => sum + s.usageCount, 0)

                return (
                  <Card
                    key={category.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {category.name}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{count} scripts</span>
                        <span className="text-muted-foreground">{totalUsage} total uses</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="scripts" className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="py-8 text-center text-muted-foreground">Loading scripts...</div>
                </CardContent>
              </Card>
            ) : filteredScripts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No scripts found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? "Try adjusting your search terms" : "No scripts match the selected category"}
                    </p>
                    <Button onClick={() => setAddDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Script
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredScripts.map((script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    onView={handleViewScript}
                    onEdit={handleEditScript}
                    onCopy={handleCopyScript}
                    onDelete={handleDeleteScript}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ScriptViewerSheet
          script={selectedScript}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          onEdit={handleEditScript}
          onCopy={handleCopyScript}
          onDelete={handleDeleteScript}
          onSendToClients={() => setSendToClientsOpen(true)}
        />
        <SendScriptToClientsDialog
          open={sendToClientsOpen}
          onOpenChange={setSendToClientsOpen}
          script={selectedScript}
          onSent={fetchScripts}
        />

        <AddScriptDialog
          open={addDialogOpen}
          onOpenChange={(open) => {
            setAddDialogOpen(open)
            if (!open) setEditingScript(null)
          }}
          onAddScript={handleAddScript}
          initialScript={editingScript}
          dialogTitle={editingScript ? "Edit Script" : "New Script"}
          dialogDescription={
            editingScript
              ? "Update the content, category, or tags for this script."
              : "Add a new script to your library. Scripts help you stay consistent in presentations, calls, and communications."
          }
          submitLabel={editingScript ? "Save Changes" : "Add Script"}
        />
      </div>
    </PortalLayout>
  )
}
