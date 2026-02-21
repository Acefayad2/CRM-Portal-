import { SidebarProvider } from "@/contexts/sidebar-context"
import { ContactLogsProvider } from "@/contexts/contact-logs-context"
import { ClientsProvider } from "@/contexts/clients-context"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <ContactLogsProvider>
        <ClientsProvider>{children}</ClientsProvider>
      </ContactLogsProvider>
    </SidebarProvider>
  )
}
