/** Map auth error codes to user-friendly messages */
export function getAuthErrorMessage(code: string | null): string {
  if (!code) return ""
  switch (code) {
    case "auth_callback_error":
      return "Sign-in failed. Please try again."
    case "oauth_failed":
      return "Google sign-in failed. Please try again."
    case "supabase_not_configured":
      return "Google sign-in is not configured. Add Supabase URL and anon key to .env.local."
    default:
      try {
        return decodeURIComponent(code)
      } catch {
        return code
      }
  }
}
