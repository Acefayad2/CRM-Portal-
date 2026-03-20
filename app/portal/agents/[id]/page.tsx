"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { PortalLayout } from "@/components/portal-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Send, ArrowLeft, Plus, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Agent = {
  id: string
  name: string
  role: string
  status: string
  railway_url: string | null
  orgo_computer_id: string | null
  last_heartbeat: string | null
  current_job_id: string | null
}

type Message = {
  id: string
  bot_id: string
  sender: "user" | "bot"
  content: string
  created_at: string
}

type Job = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  result: Record<string, unknown> | null
  error_message: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
}

const STATUS_COLOR: Record<string, string> = {
  idle: "bg-green-500",
  busy: "bg-yellow-500",
  offline: "bg-gray-400",
}

const JOB_STATUS_ICON: Record<string, React.ReactNode> = {
  queued: <Clock className="h-4 w-4 text-gray-400" />,
  in_progress: <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "normal" })
  const [dispatching, setDispatching] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchAll = useCallback(async () => {
    try {
      const [agentRes, messagesRes, jobsRes] = await Promise.all([
        fetch(`/api/agents/${id}`),
        fetch(`/api/agents/${id}/messages`),
        fetch(`/api/agents/${id}/jobs`),
      ])
      if (agentRes.ok) setAgent(await agentRes.json())
      if (messagesRes.ok) setMessages(await messagesRes.json())
      if (jobsRes.ok) setJobs(await jobsRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 5000)
    return () => clearInterval(interval)
  }, [fetchAll])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim()) return
    const content = message.trim()
    setMessage("")
    setSending(true)

    // Optimistic UI
    const optimistic: Message = {
      id: Date.now().toString(),
      bot_id: id,
      sender: "user",
      content,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      await fetch(`/api/agents/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      await fetchAll()
    } finally {
      setSending(false)
    }
  }

  const dispatchTask = async () => {
    if (!taskForm.title) return
    setDispatching(true)
    try {
      const res = await fetch("/api/agents/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: id, ...taskForm }),
      })
      if (res.ok) {
        await fetchAll()
        setTaskOpen(false)
        setTaskForm({ title: "", description: "", priority: "normal" })
      }
    } finally {
      setDispatching(false)
    }
  }

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </PortalLayout>
    )
  }

  if (!agent) {
    return (
      <PortalLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Agent not found.</p>
          <Button variant="link" onClick={() => router.push("/portal/agents")}>Back to Agents</Button>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/portal/agents">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground capitalize">{agent.role}</span>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <span className={`h-2 w-2 rounded-full ${STATUS_COLOR[agent.status] ?? "bg-gray-400"}`} />
                    <span className="capitalize">{agent.status}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dispatch Task
          </Button>
        </div>

        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="tasks">Task History ({jobs.length})</TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card className="flex flex-col h-[600px]">
              <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Bot className="h-10 w-10 mb-2" />
                      <p>No messages yet. Send a message to {agent.name}.</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                          msg.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-muted text-foreground"
                        )}
                      >
                        {msg.content}
                        <p className={cn(
                          "text-xs mt-1",
                          msg.sender === "user" ? "text-blue-100" : "text-muted-foreground"
                        )}>
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4 flex space-x-2">
                  <Input
                    placeholder={`Message ${agent.name}...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    disabled={sending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !message.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <div className="space-y-3">
              {jobs.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                    <Clock className="h-10 w-10 mb-2" />
                    <p>No tasks yet. Dispatch a task to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {JOB_STATUS_ICON[job.status] ?? <Clock className="h-4 w-4" />}
                          <CardTitle className="text-base">{job.title}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">{job.priority}</Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              job.status === "completed" && "border-green-500 text-green-600",
                              job.status === "failed" && "border-red-500 text-red-600",
                              job.status === "in_progress" && "border-yellow-500 text-yellow-600",
                            )}
                          >
                            {job.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-1">
                      {job.description && <p>{job.description}</p>}
                      {job.result && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs font-mono whitespace-pre-wrap">
                          {JSON.stringify(job.result, null, 2)}
                        </div>
                      )}
                      {job.error_message && (
                        <p className="text-red-500 text-xs">{job.error_message}</p>
                      )}
                      <p className="text-xs">Created {new Date(job.created_at).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dispatch Task Dialog */}
      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispatch Task to {agent.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Task Title</Label>
              <Input
                placeholder="e.g. Research top 10 competitors"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                placeholder="Detailed instructions for the agent..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskOpen(false)}>Cancel</Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={dispatchTask}
              disabled={dispatching || !taskForm.title}
            >
              {dispatching ? "Dispatching..." : "Dispatch Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  )
}
