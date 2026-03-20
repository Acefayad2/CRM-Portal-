"use client"

import { useState, useEffect, useCallback } from "react"
import { PortalLayout } from "@/components/portal-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Bot, Circle, MessageSquare, Zap } from "lucide-react"
import Link from "next/link"

type Agent = {
  id: string
  name: string
  role: string
  status: "idle" | "busy" | "offline"
  railway_url: string | null
  orgo_computer_id: string | null
  last_heartbeat: string | null
  current_job_id: string | null
  created_at: string
}

const STATUS_COLOR: Record<string, string> = {
  idle: "bg-green-500",
  busy: "bg-yellow-500",
  offline: "bg-gray-400",
}

const STATUS_LABEL: Record<string, string> = {
  idle: "Idle",
  busy: "Busy",
  offline: "Offline",
}

const ROLES = [
  "research",
  "email",
  "social media",
  "data analysis",
  "scheduling",
  "customer support",
  "content creation",
  "general",
]

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: "", role: "", railway_url: "" })
  const [saving, setSaving] = useState(false)

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents")
      if (res.ok) {
        const data = await res.json()
        setAgents(data)
      }
    } catch (e) {
      console.error("Failed to fetch agents", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 10000)
    return () => clearInterval(interval)
  }, [fetchAgents])

  const handleAdd = async () => {
    if (!form.name || !form.role) return
    setSaving(true)
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        await fetchAgents()
        setAddOpen(false)
        setForm({ name: "", role: "", railway_url: "" })
      }
    } finally {
      setSaving(false)
    }
  }

  const idleCount = agents.filter((a) => a.status === "idle").length
  const busyCount = agents.filter((a) => a.status === "busy").length
  const offlineCount = agents.filter((a) => a.status === "offline").length

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agents</h1>
            <p className="text-muted-foreground">
              Manage your Clawbot agents, assign tasks, and monitor their activity.
            </p>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Circle className="h-5 w-5 text-green-600 fill-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{idleCount}</p>
                  <p className="text-sm text-muted-foreground">Idle</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{busyCount}</p>
                  <p className="text-sm text-muted-foreground">Busy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Circle className="h-5 w-5 text-gray-400 fill-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{offlineCount}</p>
                  <p className="text-sm text-muted-foreground">Offline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No agents yet</h3>
            <p className="text-muted-foreground mb-4">Add your first Clawbot agent to get started.</p>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Link key={agent.id} href={`/portal/agents/${agent.id}`}>
                <Card className="hover:border-blue-400 transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <p className="text-xs text-muted-foreground capitalize">{agent.role}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="flex items-center space-x-1 capitalize"
                      >
                        <span className={`h-2 w-2 rounded-full ${STATUS_COLOR[agent.status] ?? "bg-gray-400"}`} />
                        <span>{STATUS_LABEL[agent.status] ?? agent.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat & Tasks</span>
                      </span>
                      {agent.last_heartbeat && (
                        <span>
                          Last seen {new Date(agent.last_heartbeat).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add Agent Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Research Bot"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Specialty</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Railway URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                placeholder="https://your-bot.up.railway.app"
                value={form.railway_url}
                onChange={(e) => setForm({ ...form, railway_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleAdd}
              disabled={saving || !form.name || !form.role}
            >
              {saving ? "Adding..." : "Add Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  )
}
