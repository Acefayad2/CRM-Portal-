"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react"

const CONTACT_LOGS_KEY = "portal-contact-logs"

export interface ContactLogEntry {
  id: string
  clientId: string
  clientName: string
  action: "call" | "text" | "email"
  timestamp: string
  outcome: string
}

function isInCurrentWeek(date: Date): boolean {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  const nextMonday = new Date(monday)
  nextMonday.setDate(nextMonday.getDate() + 7)
  return d >= monday && d < nextMonday
}

interface ContactLogsContextValue {
  recentContacts: ContactLogEntry[]
  contactedThisWeekCount: number
  logContact: (
    clientId: string,
    clientName: string,
    action: "call" | "text" | "email",
    outcome?: string
  ) => void
  getLastCall: (clientId: string) => string | null
  getLastContact: (clientId: string) => string | null
  getClientContactHistory: (clientId: string) => ContactLogEntry[]
}

const ContactLogsContext = createContext<ContactLogsContextValue | null>(null)

function loadLogs(): ContactLogEntry[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(CONTACT_LOGS_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

function saveLogs(logs: ContactLogEntry[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CONTACT_LOGS_KEY, JSON.stringify(logs))
  } catch {
    // ignore
  }
}

export function ContactLogsProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<ContactLogEntry[]>([])

  useEffect(() => {
    setLogs(loadLogs())
  }, [])

  const logContact = useCallback(
    (
      clientId: string,
      clientName: string,
      action: "call" | "text" | "email",
      outcome = `${action} initiated`
    ) => {
      const entry: ContactLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        clientId,
        clientName,
        action,
        timestamp: new Date().toLocaleString(),
        outcome,
      }
      setLogs((prev) => {
        const next = [entry, ...prev]
        saveLogs(next)
        return next
      })
    },
    []
  )

  const getLastCall = useCallback(
    (clientId: string): string | null => {
      const call = logs.find((l) => l.clientId === clientId && l.action === "call")
      return call?.timestamp ?? null
    },
    [logs]
  )

  const getLastContact = useCallback(
    (clientId: string): string | null => {
      const latest = logs.find((l) => l.clientId === clientId)
      return latest?.timestamp ?? null
    },
    [logs]
  )

  const getClientContactHistory = useCallback(
    (clientId: string): ContactLogEntry[] => {
      return logs.filter((l) => l.clientId === clientId)
    },
    [logs]
  )

  const recentContacts = useMemo(() => logs.slice(0, 10), [logs])

  const contactedThisWeekCount = useMemo(() => {
    const unique = new Set<string>()
    for (const log of logs) {
      try {
        const date = new Date(log.timestamp)
        if (isInCurrentWeek(date)) unique.add(log.clientId)
      } catch {
        // ignore
      }
    }
    return unique.size
  }, [logs])

  const value = useMemo(
    () => ({
      recentContacts,
      contactedThisWeekCount,
      logContact,
      getLastCall,
      getLastContact,
      getClientContactHistory,
    }),
    [recentContacts, contactedThisWeekCount, logContact, getLastCall, getLastContact, getClientContactHistory]
  )

  return (
    <ContactLogsContext.Provider value={value}>
      {children}
    </ContactLogsContext.Provider>
  )
}

export function useContactLogs() {
  const ctx = useContext(ContactLogsContext)
  if (!ctx) {
    return {
      recentContacts: [] as ContactLogEntry[],
      contactedThisWeekCount: 0,
      logContact: () => {},
      getLastCall: () => null as string | null,
      getLastContact: () => null as string | null,
      getClientContactHistory: () => [] as ContactLogEntry[],
    }
  }
  return ctx
}
