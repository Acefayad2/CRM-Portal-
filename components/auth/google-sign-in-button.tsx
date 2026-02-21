import Link from "next/link"
import { GoogleIcon } from "@/components/google-icon"

interface GoogleSignInButtonProps {
  variant?: "signin" | "signup"
  redirectTo?: string
}

export function GoogleSignInButton({ variant = "signin", redirectTo }: GoogleSignInButtonProps) {
  const label = variant === "signup" ? "Sign up with Google" : "Sign in with Google"
  const href = redirectTo
    ? `/auth/signin-with-google?next=${encodeURIComponent(redirectTo)}`
    : "/auth/signin-with-google"
  return (
    <Link
      href={href}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
    >
      <GoogleIcon className="h-5 w-5" />
      {label}
    </Link>
  )
}
