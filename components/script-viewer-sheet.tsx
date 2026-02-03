"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Edit, BarChart3, Calendar, User } from "lucide-react"
import type { Script } from "@/lib/scripts-data"

interface ScriptViewerSheetProps {
  script: Script | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (script: Script) => void
  onCopy: (script: Script) => void
}

export function ScriptViewerSheet({ script, open, onOpenChange, onEdit, onCopy }: ScriptViewerSheetProps) {
  if (!script) return null

  const categoryColors = {
    presentation: "bg-blue-100 text-blue-800",
    "cold-call": "bg-green-100 text-green-800",
    recruiting: "bg-purple-100 text-purple-800",
    email: "bg-orange-100 text-orange-800",
    "objection-handling": "bg-red-100 text-red-800",
    "follow-up": "bg-indigo-100 text-indigo-800",
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader className="space-y-4">
          <div className="space-y-2">
            <SheetTitle className="text-xl">{script.title}</SheetTitle>
            <div className="flex items-center gap-2">
              <Badge className={categoryColors[script.category]}>{script.category.replace("-", " ")}</Badge>
              {script.isTemplate && <Badge variant="outline">Template</Badge>}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {script.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(script.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                {script.usageCount} uses
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onCopy(script)} className="flex items-center gap-1">
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(script)} className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {script.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Script Content</h4>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{script.content}</pre>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
