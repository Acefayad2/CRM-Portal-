"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Eye, Edit, BarChart3 } from "lucide-react"
import type { Script } from "@/lib/scripts-data"

interface ScriptCardProps {
  script: Script
  onView: (script: Script) => void
  onEdit: (script: Script) => void
  onCopy: (script: Script) => void
}

export function ScriptCard({ script, onView, onEdit, onCopy }: ScriptCardProps) {
  const categoryColors = {
    presentation: "bg-blue-100 text-blue-800",
    "cold-call": "bg-green-100 text-green-800",
    recruiting: "bg-purple-100 text-purple-800",
    email: "bg-orange-100 text-orange-800",
    "objection-handling": "bg-red-100 text-red-800",
    "follow-up": "bg-indigo-100 text-indigo-800",
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{script.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge className={categoryColors[script.category]}>{script.category.replace("-", " ")}</Badge>
              <span className="text-xs text-muted-foreground">by {script.author}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BarChart3 className="h-3 w-3" />
            {script.usageCount}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">{script.content}</p>

          <div className="flex flex-wrap gap-1">
            {script.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Updated {new Date(script.updatedAt).toLocaleDateString()}
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => onView(script)} className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onCopy(script)} className="h-8 w-8 p-0">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(script)} className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
