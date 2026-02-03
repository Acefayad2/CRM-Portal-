"use client"

import { useState } from "react"
import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScriptCard } from "@/components/script-card"
import { ScriptViewerSheet } from "@/components/script-viewer-sheet"
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
import { mockScripts, scriptCategories, type Script } from "@/lib/scripts-data"

export default function ScriptsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const categoryIcons = {
    presentation: Presentation,
    "cold-call": Phone,
    recruiting: Users,
    email: Mail,
    "objection-handling": MessageSquare,
    "follow-up": RotateCcw,
  }

  const filteredScripts = mockScripts.filter((script) => {
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
    // TODO: Implement edit functionality
    console.log("Edit script:", script.id)
  }

  const handleCopyScript = (script: Script) => {
    navigator.clipboard.writeText(script.content)
    // TODO: Show toast notification
    console.log("Copied script:", script.title)
  }

  return (
    <PortalLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Scripts Library</h1>
            <p className="text-muted-foreground">Access proven scripts for presentations, calls, and communications</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Script
          </Button>
        </div>

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
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Scripts ({mockScripts.length})
                </Badge>
                {scriptCategories.map((category) => {
                  const count = mockScripts.filter((s) => s.category === category.id).length
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
                const count = mockScripts.filter((s) => s.category === category.id).length
                const totalUsage = mockScripts
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
            {filteredScripts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No scripts found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? "Try adjusting your search terms" : "No scripts match the selected category"}
                    </p>
                    <Button>
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
        />
      </div>
    </PortalLayout>
  )
}
