/** Map auth error codes to user-friendly messages */
export function getAuthErrorMessage(code: string | null): string {
  if (!code) return ""
  switch (code) {
    case "auth_callback_error":
      return "Sign-in failed. Please try again."
    case "oauth_failed":
      return "Google sign-in failed. Please try again."
    case "supabase_not_configured":
      return "Sign-in is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
    default:
      try {
        return decodeURIComponent(code)
      } catch {
        return code
      }
  }
}
