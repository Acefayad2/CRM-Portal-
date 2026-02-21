"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { mockClients, type Client } from "@/lib/crm-data"

const CLIENTS_STORAGE_KEY = "portal-clients"

function loadClientsFromStorage(): Client[] {
  if (typeof window === "undefined") return mockClients
  try {
    const stored = localStorage.getItem(CLIENTS_STORAGE_KEY)
    if (!stored) return mockClients
    return JSON.parse(stored)
  } catch {
    return mockClients
  }
}

function saveClientsToStorage(clients: Client[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients))
  } catch {
    // ignore
  }
}

interface ClientsContextValue {
  clients: Client[]
  setClients: React.Dispatch<React.SetStateAction<Client[]>>
  addClient: (client: Client) => void
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void
  refreshClients: () => Promise<void>
  isLoading: boolean
}

const ClientsContext = createContext<ClientsContextValue | null>(null)

export function ClientsProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClientsState] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients")
      if (res.ok) {
        const { clients: data } = await res.json()
        if (Array.isArray(data)) {
          setClientsState(data)
          return
        }
      }
      // Fallback to localStorage when API not configured or error
      setClientsState(loadClientsFromStorage())
    } catch {
      setClientsState(loadClientsFromStorage())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshClients()
  }, [refreshClients])

  const setClients = useCallback((updater: React.SetStateAction<Client[]>) => {
    setClientsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      // Persist to localStorage as fallback when not using API
      saveClientsToStorage(next)
      return next
    })
  }, [])

  const addClient = useCallback(
    async (client: Client) => {
      try {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            phone: client.phone,
            status: client.status,
            stage: client.stage,
            assignedAgent: client.assignedAgent,
            tags: client.tags,
            notes: client.notes,
            files: client.files,
            contactHistory: client.contactHistory,
          }),
        })
        if (res.ok) {
          const { client: created } = await res.json()
          setClientsState((prev) => [created, ...prev])
          return
        }
      } catch {
        // fall through to localStorage
      }
      const newClient: Client = {
        ...client,
        id: client.id || `client-${Date.now()}`,
      }
      setClientsState((prev) => {
        const next = [newClient, ...prev]
        saveClientsToStorage(next)
        return next
      })
    },
    []
  )

  const updateClient = useCallback(
    async (id: string, data: Partial<Client>) => {
      try {
        const res = await fetch(`/api/clients/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          const { client: updated } = await res.json()
          setClientsState((prev) =>
            prev.map((c) => (c.id === id ? updated : c))
          )
          return
        }
      } catch {
        // fall through to local update
      }
      setClientsState((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, ...data } : c))
        saveClientsToStorage(next)
        return next
      })
    },
    []
  )

  const deleteClient = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" })
      if (res.ok) {
        setClientsState((prev) => prev.filter((c) => c.id !== id))
        return
      }
    } catch {
      // fall through
    }
    setClientsState((prev) => {
      const next = prev.filter((c) => c.id !== id)
      saveClientsToStorage(next)
      return next
    })
  }, [])

  return (
    <ClientsContext.Provider
      value={{
        clients,
        setClients,
        addClient,
        updateClient,
        deleteClient,
        refreshClients,
        isLoading,
      }}
    >
      {children}
    </ClientsContext.Provider>
  )
}

export function useClients() {
  const ctx = useContext(ClientsContext)
  if (!ctx) {
    throw new Error("useClients must be used within ClientsProvider")
  }
  return ctx
}
