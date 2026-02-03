export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: ClientStatus
  stage: ClientStage
  assignedAgent: string
  tags: string[]
  nextAppointment?: string
  lastContact?: string
  createdAt: string
  notes: string
  files: ClientFile[]
  contactHistory: ContactLog[]
}

export interface ClientFile {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
}

export interface ContactLog {
  id: string
  type: "call" | "text" | "email" | "meeting"
  timestamp: string
  agent: string
  outcome: string
  notes?: string
}

export type ClientStatus =
  | "New Lead"
  | "Working"
  | "Presentation Set"
  | "Follow-Up"
  | "Lost"
  | "Do Not Contact"

export type ClientStage = "Prospect" | "Qualified" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost"

export const mockClients: Client[] = []

export const statusOptions: ClientStatus[] = [
  "New Lead",
  "Working",
  "Presentation Set",
  "Follow-Up",
  "Lost",
  "Do Not Contact",
]

export const stageOptions: ClientStage[] = [
  "Prospect",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
]
