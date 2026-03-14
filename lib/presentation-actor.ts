import { createClient } from "@/lib/supabase/server"
import { supabase as supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase"

const DEV_PRESENTATION_EMAIL = "local-presentations@pantheon.local"

type QueryClient = NonNullable<typeof supabaseAdmin>

export type PresentationActor = {
  userId: string
  client: QueryClient
  mode: "auth" | "dev"
}

let cachedDevPresentationUserId: string | null = null

async function ensureDevPresentationUser(): Promise<string | null> {
  if (!supabaseAdmin) return null
  if (cachedDevPresentationUserId) return cachedDevPresentationUserId

  const listed = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listed.error) {
    console.error("[presentation-actor] listUsers error:", listed.error)
    return null
  }

  const existing = listed.data.users.find((user) => user.email === DEV_PRESENTATION_EMAIL)
  if (existing?.id) {
    cachedDevPresentationUserId = existing.id
    return existing.id
  }

  const created = await supabaseAdmin.auth.admin.createUser({
    email: DEV_PRESENTATION_EMAIL,
    email_confirm: true,
    user_metadata: {
      first_name: "Local",
      last_name: "Presenter",
    },
  })

  if (created.error || !created.data.user?.id) {
    const retryList = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    const retryExisting = retryList.data?.users.find((user) => user.email === DEV_PRESENTATION_EMAIL)
    if (retryExisting?.id) {
      cachedDevPresentationUserId = retryExisting.id
      return retryExisting.id
    }

    console.error("[presentation-actor] createUser error:", created.error)
    return null
  }

  cachedDevPresentationUserId = created.data.user.id
  return created.data.user.id
}

export async function resolvePresentationActor(): Promise<PresentationActor | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null

  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (user) {
    return {
      userId: user.id,
      client: authClient as QueryClient,
      mode: "auth",
    }
  }

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  const devUserId = await ensureDevPresentationUser()
  if (!devUserId) return null

  return {
    userId: devUserId,
    client: supabaseAdmin,
    mode: "dev",
  }
}
