"use client"

import { useState, useEffect } from "react"
import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrainingModuleCard } from "@/components/training-module-card"
import { TrainingModuleViewer } from "@/components/training-module-viewer"
import { BookOpen, Search, GraduationCap, Calculator, Calendar, FileText, Video, Link as LinkIcon, Download, File, Presentation, Menu, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { trainingModules, trainingCategories, type TrainingModule } from "@/lib/training-modules-data"
import { useSidebar } from "@/contexts/sidebar-context"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ResourceItem {
  id: string
  title: string
  description: string
  type: "pdf" | "video" | "link" | "document" | "presentation"
  category: "product" | "compliance" | "marketing" | "guides" | "templates"
  size?: string
  date: string
  icon: any
}

export type CourseForResources = {
  id: string
  title: string
  description: string | null
  category: string | null
  level: string | null
}

export type CoursesData = {
  courses: CourseForResources[]
  lessonCountByCourseId: Record<string, number>
  completedByCourseId: Record<string, number>
  templateSummary: { title: string; description: string; category: string | null; level: string | null; lessonCount: number }
}

const placeholderResources: ResourceItem[] = [
  { id: "prod-guide-1", title: "Life Insurance Product Guide 2024", description: "Comprehensive guide covering all life insurance products, features, and benefits available this year.", type: "pdf", category: "product", size: "2.4 MB", date: "2024-01-15", icon: FileText },
  { id: "prod-guide-2", title: "Annuity Products Overview", description: "Detailed overview of annuity products, payout options, and tax advantages.", type: "pdf", category: "product", size: "1.8 MB", date: "2024-01-10", icon: FileText },
  { id: "compliance-1", title: "State Licensing Requirements", description: "Complete guide to state-specific licensing requirements and continuing education.", type: "pdf", category: "compliance", size: "3.2 MB", date: "2024-01-20", icon: File },
  { id: "compliance-2", title: "HIPAA Compliance Checklist", description: "Essential checklist for maintaining HIPAA compliance in client communications.", type: "document", category: "compliance", size: "856 KB", date: "2024-01-18", icon: File },
  { id: "marketing-1", title: "2024 Marketing Campaign Templates", description: "Ready-to-use email templates, social media posts, and print materials.", type: "document", category: "marketing", size: "5.1 MB", date: "2024-01-12", icon: Presentation },
  { id: "marketing-2", title: "Brand Guidelines", description: "Official brand guidelines including logos, colors, fonts, and usage examples.", type: "pdf", category: "marketing", size: "4.7 MB", date: "2024-01-08", icon: FileText },
  { id: "guide-1", title: "Client Onboarding Best Practices", description: "Step-by-step guide for effective client onboarding and relationship building.", type: "pdf", category: "guides", size: "1.5 MB", date: "2024-01-22", icon: BookOpen },
  { id: "guide-2", title: "Sales Process Workflow", description: "Visual workflow diagram showing the complete sales process from lead to close.", type: "document", category: "guides", size: "2.1 MB", date: "2024-01-19", icon: Presentation },
  { id: "video-1", title: "Product Demo: Term Life Insurance", description: "Video demonstration explaining term life insurance products and features.", type: "video", category: "product", size: "45 MB", date: "2024-01-14", icon: Video },
  { id: "video-2", title: "CFT Platform Tutorial", description: "Complete tutorial on using the Client Financial Tools platform effectively.", type: "video", category: "guides", size: "128 MB", date: "2024-01-16", icon: Video },
  { id: "template-1", title: "Client Meeting Agenda Template", description: "Professional meeting agenda template for client consultations.", type: "document", category: "templates", size: "124 KB", date: "2024-01-21", icon: FileText },
  { id: "template-2", title: "Proposal Template", description: "Standardized proposal template for presenting insurance solutions to clients.", type: "document", category: "templates", size: "312 KB", date: "2024-01-17", icon: FileText },
  { id: "link-1", title: "Industry News Portal", description: "Access to the latest insurance industry news and updates.", type: "link", category: "guides", date: "2024-01-13", icon: LinkIcon },
  { id: "link-2", title: "Regulatory Updates", description: "Stay informed about regulatory changes affecting the insurance industry.", type: "link", category: "compliance", date: "2024-01-11", icon: LinkIcon },
]

export function ResourcesContent({
  coursesData,
  defaultTab = "overview",
  isTeamAdmin = false,
}: {
  coursesData: CoursesData
  defaultTab?: string
  isTeamAdmin?: boolean
}) {
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedResourceCategory, setSelectedResourceCategory] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  const categoryIcons = { all: BookOpen, licensing: GraduationCap, cft: Calculator, appointment: Calendar }

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

  const handleLessonComplete = (_moduleId: string, _lessonId: string) => {
    console.log("Lesson complete")
  }

  const getCategoryStats = (categoryId: string) => {
    const modules = categoryId === "all" ? trainingModules : trainingModules.filter((m) => m.category === categoryId)
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
    const completedModules = modules.filter((m) => m.completed).length
    return { count: modules.length, totalLessons, completedModules }
  }

  const { courses, lessonCountByCourseId, completedByCourseId, templateSummary } = coursesData
  const courseCount = courses.length

  return (
    <PortalLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          {isCollapsed && (
            <Button type="button" variant="ghost" size="icon" onClick={toggleSidebar} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors" aria-label="Expand sidebar">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">Resources</h1>
            <p className="text-white/70">Training modules, documents, guides, courses, and helpful resources</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
          />
        </div>

        <Tabs
          value={activeTab}
          className="space-y-6"
          onValueChange={(value) => {
            setActiveTab(value)
            if (value === "overview") setSelectedCategory("all")
            else if (value === "resources") setSelectedCategory("resources")
            else if (value === "courses") setSelectedCategory("all")
            else if (value === "modules" && (selectedCategory === "all" || selectedCategory === "resources")) setSelectedCategory("licensing")
          }}
        >
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Overview</TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Training ({filteredModules.length})</TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Resources ({placeholderResources.length})</TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Courses ({courseCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-white/20 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><BookOpen className="h-5 w-5" />Training Modules</CardTitle>
                  <CardDescription className="text-white/70">{trainingModules.length} training modules available</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between"><span className="text-white/70">Total Modules</span><span className="text-white font-medium">{trainingModules.length}</span></div>
                    <div className="flex items-center justify-between"><span className="text-white/70">Total Lessons</span><span className="text-white font-medium">{trainingModules.reduce((sum, m) => sum + m.lessons.length, 0)}</span></div>
                  </div>
                  <Button onClick={() => setActiveTab("modules")} className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white border-white/20">View Training Modules</Button>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><FileText className="h-5 w-5" />Resources Library</CardTitle>
                  <CardDescription className="text-white/70">{placeholderResources.length} resources available</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between"><span className="text-white/70">Total Resources</span><span className="text-white font-medium">{placeholderResources.length}</span></div>
                    <div className="flex items-center justify-between"><span className="text-white/70">Categories</span><span className="text-white font-medium">5</span></div>
                  </div>
                  <Button onClick={() => setActiveTab("resources")} className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white border-white/20">View Resources</Button>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/5 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><GraduationCap className="h-5 w-5" />Courses</CardTitle>
                  <CardDescription className="text-white/70">Structured courses with modules and lessons. Track your progress.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between"><span className="text-white/70">Published courses</span><span className="text-white font-medium">{courseCount}</span></div>
                  </div>
                  <Button onClick={() => setActiveTab("courses")} className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white border-white/20">View Courses</Button>
                </CardContent>
              </Card>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Training Categories</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trainingCategories.filter((cat) => cat.id !== "all").map((category) => {
                  const Icon = categoryIcons[category.id as keyof typeof categoryIcons]
                  const stats = getCategoryStats(category.id)
                  return (
                    <Card key={category.id} className="hover:shadow-lg transition-all cursor-pointer border-white/20 bg-white/5" onClick={() => { setSelectedCategory(category.id); setActiveTab("modules") }}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white"><Icon className="h-5 w-5" />{category.name}</CardTitle>
                        <CardDescription className="text-white/70">{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between"><span className="text-white/70">Modules</span><span className="text-white font-medium">{stats.count}</span></div>
                          <div className="flex items-center justify-between"><span className="text-white/70">Total Lessons</span><span className="text-white font-medium">{stats.totalLessons}</span></div>
                          <div className="flex items-center justify-between"><span className="text-white/70">Completed</span><span className="text-white font-medium">{stats.completedModules}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            {filteredModules.length === 0 ? (
              <Card className="border-white/20 bg-white/5"><CardContent className="py-12 text-center"><p className="text-white/70">No training modules found matching your search.</p></CardContent></Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredModules.map((module) => (
                  <TrainingModuleCard key={module.id} module={module} onStart={handleStartModule} onView={handleViewModule} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            {courseCount === 0 && (
              <Card className="border-white/20 bg-white/5">
                <CardContent className="py-8 text-center">
                  <p className="text-white/70">No published courses yet.</p>
                  <p className="text-white/50 text-sm mt-2">View the template below or add courses in Admin → Courses.</p>
                </CardContent>
              </Card>
            )}
            <div className="grid gap-6 md:grid-cols-2">
              {courseCount === 0 && (
                <Link href="/portal/courses/template">
                  <Card className="border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer h-full border-2 border-dashed border-white/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-2 rounded-lg bg-white/10 border border-white/20 flex-shrink-0"><BookOpen className="h-5 w-5 text-white" /></div>
                        <ChevronRight className="h-5 w-5 text-white/50 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg text-white line-clamp-2">{templateSummary.title}</CardTitle>
                          <CardDescription className="text-white/70 text-sm line-clamp-2 mt-1">{templateSummary.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {templateSummary.category && <Badge variant="outline" className="text-xs border-white/20 text-white/80">{templateSummary.category}</Badge>}
                        {templateSummary.level && <Badge variant="outline" className="text-xs border-white/20 text-white/60">{templateSummary.level}</Badge>}
                        <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-200">Demo</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">{templateSummary.lessonCount} lessons</span>
                        <span className="text-white/70">View template</span>
                      </div>
                      <Progress value={0} className="h-2 bg-white/10" />
                    </CardContent>
                  </Card>
                </Link>
              )}
              {courses.map((course) => {
                const total = lessonCountByCourseId[course.id] ?? 0
                const completedCount = completedByCourseId[course.id] ?? 0
                const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0
                const label = total === 0 ? "Start" : completedCount >= total ? "Completed" : "Continue"
                return (
                  <Link key={course.id} href={`/portal/courses/${course.id}`}>
                    <Card className="border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="p-2 rounded-lg bg-white/10 border border-white/20 flex-shrink-0"><BookOpen className="h-5 w-5 text-white" /></div>
                          <ChevronRight className="h-5 w-5 text-white/50 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg text-white line-clamp-2">{course.title}</CardTitle>
                            <CardDescription className="text-white/70 text-sm line-clamp-2 mt-1">{course.description ?? "—"}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {course.category && <Badge variant="outline" className="text-xs border-white/20 text-white/80">{course.category}</Badge>}
                          {course.level && <Badge variant="outline" className="text-xs border-white/20 text-white/60">{course.level}</Badge>}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">{total} lesson{total !== 1 ? "s" : ""}</span>
                          <span className={label === "Completed" ? "text-green-400" : label === "Continue" ? "text-blue-300" : "text-white/70"}>{label}</span>
                        </div>
                        {total > 0 && <Progress value={percent} className="h-2 bg-white/10" />}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Button variant={selectedResourceCategory === "all" ? "default" : "outline"} onClick={() => setSelectedResourceCategory("all")} className={selectedResourceCategory === "all" ? "bg-white/20 text-white border-white/30" : "bg-white/10 hover:bg-white/20 text-white border-white/20"} size="sm">All</Button>
                {["product", "compliance", "marketing", "guides", "templates"].map((cat) => (
                  <Button key={cat} variant={selectedResourceCategory === cat ? "default" : "outline"} onClick={() => setSelectedResourceCategory(cat)} className={selectedResourceCategory === cat ? "bg-white/20 text-white border-white/30" : "bg-white/10 hover:bg-white/20 text-white border-white/20"} size="sm">{cat.charAt(0).toUpperCase() + cat.slice(1)}</Button>
                ))}
              </div>
              {isTeamAdmin && (
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add resource
                </Button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {placeholderResources
                .filter((resource) => {
                  const matchesCategory = selectedResourceCategory === "all" || resource.category === selectedResourceCategory
                  const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || resource.description.toLowerCase().includes(searchQuery.toLowerCase())
                  return matchesCategory && matchesSearch
                })
                .map((resource) => {
                  const Icon = resource.icon
                  const categoryColors: Record<string, string> = {
                    product: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                    compliance: "bg-red-500/20 text-red-300 border-red-500/30",
                    marketing: "bg-purple-500/20 text-purple-300 border-purple-500/30",
                    guides: "bg-green-500/20 text-green-300 border-green-500/30",
                    templates: "bg-orange-500/20 text-orange-300 border-orange-500/30",
                  }
                  return (
                    <Card key={resource.id} className="hover:shadow-lg transition-all border-white/20 bg-white/5">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className={`p-2 rounded-lg ${categoryColors[resource.category]} border flex-shrink-0`}><Icon className="h-5 w-5" /></div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg text-white line-clamp-2">{resource.title}</CardTitle>
                            <CardDescription className="text-white/70 text-sm line-clamp-2 mt-1">{resource.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-xs border-0 ${categoryColors[resource.category]}`}>{resource.category}</Badge>
                          <Badge variant="outline" className="text-xs border-white/20 text-white/70">{resource.type.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>{new Date(resource.date).toLocaleDateString()}</span>
                          {resource.size && <span>{resource.size}</span>}
                        </div>
                        <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => { if (resource.type === "link") window.open("#", "_blank"); else alert(`Opening ${resource.title}...`) }}>
                          {resource.type === "link" ? <><LinkIcon className="h-4 w-4 mr-2" />Open Link</> : resource.type === "video" ? <><Video className="h-4 w-4 mr-2" />Watch Video</> : <><Download className="h-4 w-4 mr-2" />Download</>}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
            {placeholderResources.filter((r) => (selectedResourceCategory === "all" || r.category === selectedResourceCategory) && (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 && (
              <Card className="border-white/20 bg-white/5"><CardContent className="py-12 text-center"><p className="text-white/70">No resources found matching your search.</p></CardContent></Card>
            )}
          </TabsContent>
        </Tabs>

        <TrainingModuleViewer module={selectedModule} isOpen={viewerOpen} onClose={() => { setViewerOpen(false); setSelectedModule(null) }} onLessonComplete={handleLessonComplete} />
      </div>
    </PortalLayout>
  )
}
