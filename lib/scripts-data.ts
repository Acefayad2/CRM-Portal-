export interface Script {
  id: string
  title: string
  category: "presentation" | "cold-call" | "recruiting" | "email" | "objection-handling" | "follow-up"
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  author: string
  isTemplate: boolean
  usageCount: number
}

export const scriptCategories = [
  {
    id: "presentation",
    name: "Presentation Scripts",
    description: "Scripts for client presentations and product demos",
  },
  { id: "cold-call", name: "Cold Call Scripts", description: "Opening scripts for prospecting calls" },
  { id: "recruiting", name: "Recruiting Scripts", description: "Scripts for recruiting new agents" },
  { id: "email", name: "Email Templates", description: "Professional email templates for various scenarios" },
  { id: "objection-handling", name: "Objection Handling", description: "Responses to common client objections" },
  { id: "follow-up", name: "Follow-Up Scripts", description: "Scripts for following up with prospects" },
]

export const mockScripts: Script[] = []
