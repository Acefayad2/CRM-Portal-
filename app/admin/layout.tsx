import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") {
    redirect("/portal")
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <a href="/admin/courses" className="font-semibold text-foreground">
            Admin
          </a>
          <a href="/admin/courses" className="text-muted-foreground hover:text-foreground text-sm">
            Courses
          </a>
          <a href="/portal" className="text-muted-foreground hover:text-foreground text-sm ml-auto">
            Back to portal
          </a>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
