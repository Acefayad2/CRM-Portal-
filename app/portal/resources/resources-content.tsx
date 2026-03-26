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
  href: string
  actionLabel: string
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

const resourceLibrary: ResourceItem[] = [
  { id: "prod-guide-1", title: "Pantheon Course Template", description: "Reference course structure with modules and lessons that shows the intended learning experience inside the portal.", type: "presentation", category: "product", size: "Portal", date: "2026-03-11", icon: Presentation, href: "/portal/courses/template", actionLabel: "Open course" },
  { id: "prod-guide-2", title: "CFT Training Module", description: "Internal walkthrough for client financial tools workflows, reporting, and presentation prep.", type: "video", category: "product", size: "Training", date: "2026-03-11", icon: Video, href: "/portal/resources?tab=modules", actionLabel: "Open training" },
  { id: "compliance-1", title: "Twilio Use Policy", description: "Live policy page covering SMS usage, consent, and communications compliance for the portal.", type: "document", category: "compliance", size: "Web page", date: "2026-03-11", icon: File, href: "/policy/twilio", actionLabel: "View policy" },
  { id: "compliance-2", title: "Privacy Policy", description: "Current privacy terms for platform data handling, customer information, and service usage.", type: "document", category: "compliance", size: "Web page", date: "2026-03-11", icon: FileText, href: "/privacy", actionLabel: "View policy" },
  { id: "marketing-1", title: "Scripts Library", description: "Use approved call, presentation, recruiting, and follow-up scripts directly from the portal.", type: "document", category: "marketing", size: "Portal", date: "2026-03-11", icon: FileText, href: "/portal/scripts", actionLabel: "Open scripts" },
  { id: "marketing-2", title: "Team Billing Setup", description: "Manage plan selection, team creation, and SMS credits from the billing console.", type: "link", category: "marketing", size: "Portal", date: "2026-03-11", icon: LinkIcon, href: "/portal/settings/billing", actionLabel: "Open billing" },
  { id: "guide-1", title: "Appointment Training", description: "Internal training content for setting, preparing, and following through on client appointments.", type: "video", category: "guides", size: "Training", date: "2026-03-11", icon: Calendar, href: "/portal/resources?tab=modules", actionLabel: "Open training" },
  { id: "guide-2", title: "SMS Test Console", description: "Operational page for validating outbound messaging configuration and webhook behavior.", type: "link", category: "guides", size: "Portal", date: "2026-03-11", icon: LinkIcon, href: "/test-sms", actionLabel: "Open console" },
  { id: "template-1", title: "Billing Templates", description: "Stripe-backed plan and SMS purchase flow available from Billing for workspace setup and expansion.", type: "document", category: "templates", size: "Portal", date: "2026-03-11", icon: FileText, href: "/portal/settings/billing", actionLabel: "Open billing" },
  { id: "template-2", title: "Team Invite Flow", description: "Use the Admin area to invite teammates and approve join requests with your workspace team code.", type: "document", category: "templates", size: "Portal", date: "2026-03-11", icon: FileText, href: "/portal/admin", actionLabel: "Open admin" },
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

  const handleLessonComplete = (_moduleId: string, _lessonId: string) => {}

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
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
          {isCollapsed && (
            <Button type="button" variant="ghost" size="icon" onClick={toggleSidebar} className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors lg:inline-flex" aria-label="Expand sidebar">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Resources</h1>
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
            <TabsTrigger value="resources" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Resources ({resourceLibrary.length})</TabsTrigger>
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
                  <CardDescription className="text-white/70">{resourceLibrary.length} resources available</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between"><span className="text-white/70">Total Resources</span><span className="text-white font-medium">{resourceLibrary.length}</span></div>
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
              {resourceLibrary
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
                        <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20" asChild>
                          <Link href={resource.href}>
                            {resource.type === "link" ? <><LinkIcon className="h-4 w-4 mr-2" />{resource.actionLabel}</> : resource.type === "video" ? <><Video className="h-4 w-4 mr-2" />{resource.actionLabel}</> : <><Download className="h-4 w-4 mr-2" />{resource.actionLabel}</>}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
            {resourceLibrary.filter((r) => (selectedResourceCategory === "all" || r.category === selectedResourceCategory) && (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 && (
              <Card className="border-white/20 bg-white/5"><CardContent className="py-12 text-center"><p className="text-white/70">No resources found matching your search.</p></CardContent></Card>
            )}
          </TabsContent>
        </Tabs>

        <TrainingModuleViewer module={selectedModule} isOpen={viewerOpen} onClose={() => { setViewerOpen(false); setSelectedModule(null) }} onLessonComplete={handleLessonComplete} />
      </div>
    </PortalLayout>
  )
}
