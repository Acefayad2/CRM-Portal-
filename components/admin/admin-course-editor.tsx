"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Plus, ChevronDown, ChevronRight, Trash2, GripVertical } from "lucide-react"
import type { CourseWithOutline } from "@/lib/courses-db"

type CourseWithModules = CourseWithOutline

interface AdminCourseEditorProps {
  course: CourseWithModules
}

export function AdminCourseEditor({ course: initialCourse }: AdminCourseEditorProps) {
  const router = useRouter()
  const [courseForm, setCourseForm] = useState({
    title: initialCourse.title,
    description: initialCourse.description ?? "",
    category: initialCourse.category ?? "",
    level: initialCourse.level ?? "",
    is_published: initialCourse.is_published,
  })
  const [savingCourse, setSavingCourse] = useState(false)
  const [openModuleId, setOpenModuleId] = useState<string | null>(null)
  const [addModuleOpen, setAddModuleOpen] = useState(false)
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null)
  const [newModuleTitle, setNewModuleTitle] = useState("")
  const [newLessonTitle, setNewLessonTitle] = useState("")

  const course = { ...initialCourse, ...courseForm }

  async function saveCourse() {
    setSavingCourse(true)
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseForm.title,
          description: courseForm.description || undefined,
          category: courseForm.category || undefined,
          level: courseForm.level || undefined,
          is_published: courseForm.is_published,
        }),
      })
      if (res.ok) router.refresh()
      else throw new Error(await res.json().then((r) => r.error))
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSavingCourse(false)
    }
  }

  async function addModule() {
    if (!newModuleTitle.trim()) return
    try {
      const res = await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: course.id,
          title: newModuleTitle.trim(),
          sort_order: initialCourse.modules.length,
        }),
      })
      if (!res.ok) throw new Error(await res.json().then((r) => r.error))
      setNewModuleTitle("")
      setAddModuleOpen(false)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add module")
    }
  }

  async function addLesson(moduleId: string) {
    if (!newLessonTitle.trim()) return
    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: moduleId,
          title: newLessonTitle.trim(),
          sort_order: initialCourse.modules.find((m) => m.id === moduleId)?.lessons.length ?? 0,
        }),
      })
      if (!res.ok) throw new Error(await res.json().then((r) => r.error))
      setNewLessonTitle("")
      setAddLessonModuleId(null)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add lesson")
    }
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Delete this module and all its lessons?")) return
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.json().then((r) => r.error))
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm("Delete this lesson?")) return
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.json().then((r) => r.error))
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={courseForm.title}
              onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={courseForm.description}
              onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="mt-1"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Category</Label>
              <Input
                value={courseForm.category}
                onChange={(e) => setCourseForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. licensing"
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label>Level</Label>
              <Input
                value={courseForm.level}
                onChange={(e) => setCourseForm((f) => ({ ...f, level: e.target.value }))}
                placeholder="e.g. beginner"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={courseForm.is_published}
              onCheckedChange={(checked) => setCourseForm((f) => ({ ...f, is_published: checked }))}
            />
            <Label>Published (visible on portal)</Label>
          </div>
          <Button onClick={saveCourse} disabled={savingCourse}>
            {savingCourse ? "Saving…" : "Save course"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Modules & lessons</CardTitle>
          <Dialog open={addModuleOpen} onOpenChange={setAddModuleOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New module</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="e.g. Course content"
                />
                <Button onClick={addModule} className="w-full">
                  Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-2">
          {initialCourse.modules.length === 0 ? (
            <p className="text-muted-foreground text-sm">No modules yet. Add one to start adding lessons.</p>
          ) : (
            initialCourse.modules.map((mod) => (
              <Collapsible
                key={mod.id}
                open={openModuleId === mod.id}
                onOpenChange={(open) => setOpenModuleId(open ? mod.id : null)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/50">
                    {openModuleId === mod.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">{mod.title}</span>
                    <span className="text-muted-foreground text-sm">({mod.lessons.length} lessons)</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        deleteModule(mod.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pl-6 pt-2 space-y-2">
                    {mod.lessons.map((les) => (
                      <div
                        key={les.id}
                        className="flex items-center gap-2 rounded border bg-muted/30 px-3 py-2 text-sm"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{les.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => deleteLesson(les.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {addLessonModuleId === mod.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          placeholder="Lesson title"
                          onKeyDown={(e) => e.key === "Enter" && addLesson(mod.id)}
                        />
                        <Button size="sm" onClick={() => addLesson(mod.id)}>
                          Add
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setAddLessonModuleId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddLessonModuleId(mod.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add lesson
                      </Button>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <a href={`/portal/courses/${initialCourse.id}`} target="_blank" rel="noopener noreferrer" className="underline">
          View course on portal
        </a>
      </div>
    </div>
  )
}
