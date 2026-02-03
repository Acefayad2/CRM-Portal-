"use client"

import { useState } from "react"
import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrainingModuleCard } from "@/components/training-module-card"
import { TrainingModuleViewer } from "@/components/training-module-viewer"
import { BookOpen, Search, GraduationCap, Calculator, Calendar } from "lucide-react"
import { trainingModules, trainingCategories, type TrainingModule } from "@/lib/training-modules-data"

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const categoryIcons = {
    all: BookOpen,
    licensing: GraduationCap,
    cft: Calculator,
    appointment: Calendar,
  }

  const filteredModules = trainingModules.filter((module) => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || module.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleStartModule = (module: TrainingModule) => {
    setSelectedModule(module)
    setViewerOpen(true)
  }

  const handleViewModule = (module: TrainingModule) => {
    setSelectedModule(module)
    setViewerOpen(true)
  }

  const handleLessonComplete = (moduleId: string, lessonId: string) => {
    // TODO: Implement lesson completion tracking
    console.log(`Module ${moduleId}, Lesson ${lessonId} completed`)
  }

  const getCategoryStats = (categoryId: string) => {
    const modules = categoryId === "all" ? trainingModules : trainingModules.filter((m) => m.category === categoryId)
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
    const completedModules = modules.filter((m) => m.completed).length
    return {
      count: modules.length,
      totalLessons,
      completedModules,
    }
  }

  return (
    <PortalLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Training Modules</h1>
          <p className="text-white/70">Comprehensive training resources to enhance your skills and knowledge</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            placeholder="Search training modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
          />
        </div>

        <Tabs value={selectedCategory === "all" ? "overview" : "modules"} className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger
              value="overview"
              onClick={() => setSelectedCategory("all")}
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              onClick={() => setSelectedCategory(selectedCategory === "all" ? "licensing" : selectedCategory)}
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              Modules ({filteredModules.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trainingCategories
                .filter((cat) => cat.id !== "all")
                .map((category) => {
                  const Icon = categoryIcons[category.id as keyof typeof categoryIcons]
                  const stats = getCategoryStats(category.id)

                  return (
                    <Card
                      key={category.id}
                      className="hover:shadow-lg transition-all cursor-pointer border-white/20 bg-white/5 backdrop-blur-sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Icon className="h-5 w-5" />
                          {category.name}
                        </CardTitle>
                        <CardDescription className="text-white/70">{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">Modules</span>
                            <span className="text-white font-medium">{stats.count}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">Total Lessons</span>
                            <span className="text-white font-medium">{stats.totalLessons}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">Completed</span>
                            <span className="text-white font-medium">{stats.completedModules}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            {filteredModules.length === 0 ? (
              <Card className="border-white/20 bg-white/5 backdrop-blur-sm">
                <CardContent className="py-12 text-center">
                  <p className="text-white/70">No training modules found matching your search.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredModules.map((module) => (
                  <TrainingModuleCard
                    key={module.id}
                    module={module}
                    onStart={handleStartModule}
                    onView={handleViewModule}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <TrainingModuleViewer
          module={selectedModule}
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false)
            setSelectedModule(null)
          }}
          onLessonComplete={handleLessonComplete}
        />
      </div>
    </PortalLayout>
  )
}
