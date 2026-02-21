"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import {
  Settings,
  User,
  Bell,
  Calendar,
  Shield,
  Mail,
  Phone,
  Lock,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Users,
  Pencil,
} from "lucide-react"

function ChangePasswordCard() {
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [sendLoading, setSendLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSendCode = async () => {
    setError("")
    setSendLoading(true)
    try {
      const res = await fetch("/api/auth/request-password-change", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to send code")
        return
      }
      setCodeSent(true)
    } finally {
      setSendLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setSubmitLoading(true)
    try {
      const res = await fetch("/api/auth/confirm-password-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to change password")
        return
      }
      setSuccess(true)
      setCode("")
      setNewPassword("")
      setConfirmPassword("")
      setCodeSent(false)
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <Card className="border-white/20 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Lock className="h-5 w-5 mr-2" />
          Security
        </CardTitle>
        <CardDescription className="text-white/70">
          Change your password. A verification code will be sent to your registered phone via SMS (valid 5 minutes).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success ? (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Password updated. You can use your new password to sign in.
          </div>
        ) : (
          <>
            {!codeSent ? (
              <div className="space-y-4">
                <p className="text-white/80 text-sm">
                  We&apos;ll send a 6-digit code to the phone number on your account. Click below to receive the code.
                </p>
                <Button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendLoading}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  {sendLoading ? "Sending..." : <><Lock className="h-4 w-4 shrink-0" /> Change password</>}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="changePwCode" className="text-white">
                    Verification code
                  </Label>
                  <Input
                    id="changePwCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-mono text-lg tracking-widest"
                  />
                  <p className="text-white/50 text-xs">Code expires in 5 minutes. Not received? <button type="button" onClick={handleSendCode} disabled={sendLoading} className="text-blue-300 hover:underline">Resend</button></p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">
                    New password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm new password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setCodeSent(false); setCode(""); setNewPassword(""); setConfirmPassword(""); setError(""); }}
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!code.trim() || code.length !== 6 || !newPassword || !confirmPassword || submitLoading}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    {submitLoading ? "Updating..." : <><Lock className="h-4 w-4 shrink-0" /> Change password</>}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  // Profile state
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [profileVerificationStep, setProfileVerificationStep] = useState<"idle" | "code_sent">("idle")
  const [profileVerificationCode, setProfileVerificationCode] = useState("")
  const [profileSendCodeLoading, setProfileSendCodeLoading] = useState(false)
  const [profileSaveLoading, setProfileSaveLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    followUpReminders: true,
    teamUpdates: true,
    clientUpdates: false,
  })

  // Calendar integrations (Google status loaded from API; feed URL for mobile/Apple/any app)
  const [calendarIntegrations, setCalendarIntegrations] = useState({
    googleCalendar: false,
    appleCalendar: false,
    syncFrequency: "realtime",
  })
  const [calendarFeedUrl, setCalendarFeedUrl] = useState("")
  const [calendarFeedLoading, setCalendarFeedLoading] = useState(false)
  const [calendarDisconnectLoading, setCalendarDisconnectLoading] = useState(false)

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: "team", // public, team, private
    showEmail: true,
    showPhone: true,
    allowTimeSlotRequests: true,
    shareAvailability: true,
  })

  // Load profile on mount
  useEffect(() => {
    let cancelled = false
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        setProfile({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
        })
      })
      .finally(() => { if (!cancelled) setProfileLoaded(true) })
    return () => { cancelled = true }
  }, [])

  const handleProfileSendCode = async () => {
    setProfileError("")
    setProfileSendCodeLoading(true)
    try {
      const res = await fetch("/api/auth/request-profile-verification-code", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setProfileError(data.error ?? "Failed to send code")
        return
      }
      setProfileVerificationStep("code_sent")
    } finally {
      setProfileSendCodeLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    setProfileError("")
    if (!profileVerificationCode.trim() || profileVerificationCode.length !== 6) {
      setProfileError("Enter the 6-digit code sent to your phone")
      return
    }
    setProfileSaveLoading(true)
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: profileVerificationCode.trim(),
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setProfileError(data.error ?? "Failed to save")
        return
      }
      setProfileSuccess(true)
      setProfileVerificationStep("idle")
      setProfileVerificationCode("")
      setTimeout(() => setProfileSuccess(false), 3000)
    } finally {
      setProfileSaveLoading(false)
    }
  }

  // Load calendar feed URL and Google connection status
  useEffect(() => {
    let cancelled = false
    setCalendarFeedLoading(true)
    Promise.all([
      fetch("/api/calendar/feed/token").then((r) => (r.ok ? r.json() : { feedUrl: null })),
      fetch("/api/calendar/google/status").then((r) => (r.ok ? r.json() : { connected: false })),
    ])
      .then(([feedData, statusData]) => {
        if (cancelled) return
        if (feedData?.feedUrl) setCalendarFeedUrl(feedData.feedUrl)
        setCalendarIntegrations((prev) => ({ ...prev, googleCalendar: !!statusData?.connected }))
      })
      .catch(() => {
        if (!cancelled) setCalendarIntegrations((prev) => ({ ...prev, googleCalendar: false }))
      })
      .finally(() => {
        if (!cancelled) setCalendarFeedLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // After redirect from Google OAuth, show success
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    if (params.get("google") === "connected") {
      setCalendarIntegrations((prev) => ({ ...prev, googleCalendar: true }))
      window.history.replaceState({}, "", window.location.pathname + "?tab=calendar")
    }
  }, [])

  const handleConnectGoogle = () => {
    window.location.href = "/api/calendar/google/connect"
  }

  const handleConnectApple = () => {
    // Apple Calendar: subscribe via the feed URL below
    alert("Use the \"Subscribe with any calendar app\" URL below in Apple Calendar: File → New Calendar Subscription, then paste the URL. Your events will sync automatically.")
  }

  const handleDisconnectGoogle = async () => {
    setCalendarDisconnectLoading(true)
    try {
      const res = await fetch("/api/calendar/google/disconnect", { method: "POST" })
      if (res.ok) {
        setCalendarIntegrations((prev) => ({ ...prev, googleCalendar: false }))
      }
    } finally {
      setCalendarDisconnectLoading(false)
    }
  }

  const handleDisconnectApple = () => {
    setCalendarIntegrations((prev) => ({ ...prev, appleCalendar: false }))
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteStep, setDeleteStep] = useState<"idle" | "code_sent">("idle")
  const [deleteCode, setDeleteCode] = useState("")
  const [deleteSendLoading, setDeleteSendLoading] = useState(false)
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const router = useRouter()

  const handleRequestDeleteCode = async () => {
    setDeleteError("")
    setDeleteSendLoading(true)
    try {
      const res = await fetch("/api/auth/request-delete-account-code", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error ?? "Failed to send code")
        return
      }
      setDeleteStep("code_sent")
    } finally {
      setDeleteSendLoading(false)
    }
  }

  const handleConfirmDeleteAccount = async () => {
    if (!deleteCode.trim() || deleteCode.length !== 6) {
      setDeleteError("Enter the 6-digit code sent to your phone")
      return
    }
    setDeleteError("")
    setDeleteConfirmLoading(true)
    try {
      const res = await fetch("/api/auth/confirm-delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: deleteCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error ?? "Failed to delete account")
        return
      }
      const supabase = createClient()
      await supabase.auth.signOut()
      setDeleteDialogOpen(false)
      router.push("/login?message=account_deleted")
    } finally {
      setDeleteConfirmLoading(false)
    }
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setDeleteStep("idle")
    setDeleteCode("")
    setDeleteError("")
  }

  return (
    <PortalLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-white/70">Manage your account preferences and configurations</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-white/70">
                  Update your personal information. Changes must be verified by text message (code sent to your phone).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!profileLoaded ? (
                  <p className="text-white/60 text-sm">Loading profile...</p>
                ) : (
                  <>
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-white/20">
                    <AvatarImage src="" alt="Profile" />
                    <AvatarFallback className="bg-white/10 text-white text-xl">
                      {profile.firstName?.[0] || profile.lastName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                      Change Photo
                    </Button>
                    <p className="text-xs text-white/60 mt-1">JPG, PNG or GIF. Max size 2MB</p>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Verification required to save */}
                <Separator className="bg-white/10" />
                {profileSuccess ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    Profile saved successfully.
                  </div>
                ) : profileVerificationStep === "idle" ? (
                  <div className="space-y-2">
                    <p className="text-white/80 text-sm">
                      To save changes, we&apos;ll send a verification code to your phone.
                    </p>
                    <Button
                      type="button"
                      onClick={handleProfileSendCode}
                      disabled={profileSendCodeLoading}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      {profileSendCodeLoading ? (
                        "Sending..."
                      ) : (
                        <>
                          <Pencil className="h-4 w-4 shrink-0" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="profileCode" className="text-white text-sm">
                      Verification code (sent to your phone)
                    </Label>
                    <Input
                      id="profileCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter 6-digit code"
                      value={profileVerificationCode}
                      onChange={(e) => setProfileVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-mono text-lg tracking-widest w-40"
                    />
                    <p className="text-white/50 text-xs">
                      Code expires in 5 minutes. <button type="button" onClick={handleProfileSendCode} disabled={profileSendCodeLoading} className="text-blue-300 hover:underline">Resend</button>
                    </p>
                    {profileError && <p className="text-red-400 text-sm">{profileError}</p>}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => { setProfileVerificationStep("idle"); setProfileVerificationCode(""); setProfileError(""); }}
                        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleProfileUpdate}
                        disabled={profileVerificationCode.length !== 6 || profileSaveLoading}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                      >
                        {profileSaveLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Security Section - Change password via SMS code */}
            <ChangePasswordCard />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-white/70">
                  Choose how you want to be notified about important updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications" className="text-white">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-white/60">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailNotifications: checked })
                      }
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smsNotifications" className="text-white">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-white/60">Receive notifications via text message</p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="appointmentReminders" className="text-white">
                        Appointment Reminders
                      </Label>
                      <p className="text-sm text-white/60">Get reminded about upcoming appointments</p>
                    </div>
                    <Switch
                      id="appointmentReminders"
                      checked={notifications.appointmentReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, appointmentReminders: checked })
                      }
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="followUpReminders" className="text-white">
                        Follow-Up Reminders
                      </Label>
                      <p className="text-sm text-white/60">Reminders for client follow-ups</p>
                    </div>
                    <Switch
                      id="followUpReminders"
                      checked={notifications.followUpReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, followUpReminders: checked })
                      }
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="teamUpdates" className="text-white">
                        Team Updates
                      </Label>
                      <p className="text-sm text-white/60">Notifications about team activities</p>
                    </div>
                    <Switch
                      id="teamUpdates"
                      checked={notifications.teamUpdates}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, teamUpdates: checked })}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="clientUpdates" className="text-white">
                        Client Updates
                      </Label>
                      <p className="text-sm text-white/60">Notifications when clients update their information</p>
                    </div>
                    <Switch
                      id="clientUpdates"
                      checked={notifications.clientUpdates}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, clientUpdates: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            {/* Subscribe URL: works with Apple Calendar, Google Calendar (Add by URL), Outlook, mobile */}
            <Card className="border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Sync to mobile &amp; other calendars
                </CardTitle>
                <CardDescription className="text-white/70">
                  Subscribe with the link below to see your portal events in Apple Calendar, Google Calendar, or any app that supports calendar subscription. When you add or edit events here, they update there too.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {calendarFeedLoading ? (
                  <p className="text-sm text-white/60">Loading...</p>
                ) : calendarFeedUrl ? (
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={calendarFeedUrl}
                      className="flex-1 bg-white/10 border-white/20 text-white text-sm font-mono"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(calendarFeedUrl)
                        alert("Copied! Paste this URL in your calendar app to subscribe.")
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      Copy
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-white/60">Could not load feed URL.</p>
                )}
                <p className="text-xs text-white/60">
                  Apple: File → New Calendar Subscription. Google: Add calendar → From URL. Outlook: Add calendar → Subscribe from web.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Calendar Integrations
                </CardTitle>
                <CardDescription className="text-white/70">
                  Connect Google Calendar to push events when you create or update them here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Google Calendar */}
                <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Google Calendar</h3>
                      <p className="text-sm text-white/60">
                        {calendarIntegrations.googleCalendar ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  {calendarIntegrations.googleCalendar ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <Button
                        variant="outline"
                        onClick={handleDisconnectGoogle}
                        disabled={calendarDisconnectLoading}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                      >
                        {calendarDisconnectLoading ? "Disconnecting…" : "Disconnect"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleConnectGoogle}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      Connect Google Calendar
                    </Button>
                  )}
                </div>

                {/* Apple / mobile: use subscribe URL above */}
                <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Apple Calendar / mobile</h3>
                      <p className="text-sm text-white/60">
                        Use the subscribe URL above to add this calendar to Apple Calendar or any app
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleConnectApple}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    How to add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy Settings
                </CardTitle>
                <CardDescription className="text-white/70">Control who can see your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Profile Visibility</Label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-white/20 bg-white/10 px-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                    >
                      <option value="public">Public - Everyone can see</option>
                      <option value="team">Team - Only team members</option>
                      <option value="private">Private - Only me</option>
                    </select>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showEmail" className="text-white">
                        Show Email Address
                      </Label>
                      <p className="text-sm text-white/60">Display your email on your profile</p>
                    </div>
                    <Switch
                      id="showEmail"
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) => setPrivacy({ ...privacy, showEmail: checked })}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showPhone" className="text-white">
                        Show Phone Number
                      </Label>
                      <p className="text-sm text-white/60">Display your phone number on your profile</p>
                    </div>
                    <Switch
                      id="showPhone"
                      checked={privacy.showPhone}
                      onCheckedChange={(checked) => setPrivacy({ ...privacy, showPhone: checked })}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowTimeSlotRequests" className="text-white">
                        Allow Time Slot Requests
                      </Label>
                      <p className="text-sm text-white/60">Let teammates request time slots on your calendar</p>
                    </div>
                    <Switch
                      id="allowTimeSlotRequests"
                      checked={privacy.allowTimeSlotRequests}
                      onCheckedChange={(checked) => setPrivacy({ ...privacy, allowTimeSlotRequests: checked })}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="shareAvailability" className="text-white">
                        Share Availability
                      </Label>
                      <p className="text-sm text-white/60">Show your availability to teammates</p>
                    </div>
                    <Switch
                      id="shareAvailability"
                      checked={privacy.shareAvailability}
                      onCheckedChange={(checked) => setPrivacy({ ...privacy, shareAvailability: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className="border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Join a team
                </CardTitle>
                <CardDescription className="text-white/70">
                  Use a team code from your admin to join their team. Team admins receive a code when they purchase a subscription.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/join-team">
                  <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                    <Users className="h-4 w-4 mr-2" />
                    Enter team code
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription className="text-white/70">Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-400">Delete Account</h3>
                <p className="text-sm text-white/60">Permanently delete your account and all associated data. Requires verification by text message.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete account dialog - SMS verification required */}
        <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && closeDeleteDialog()}>
          <DialogContent className="sm:max-w-md bg-black/95 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-red-400 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete account
              </DialogTitle>
              <DialogDescription className="text-white/70">
                This action cannot be undone. We will send a verification code to your phone to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {deleteStep === "idle" ? (
                <>
                  <p className="text-sm text-white/80">
                    Click below to receive a 6-digit code on your registered phone. Enter the code to permanently delete your account.
                  </p>
                  <Button
                    type="button"
                    onClick={handleRequestDeleteCode}
                    disabled={deleteSendLoading}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                  >
                    {deleteSendLoading ? "Sending..." : "Send code to my phone"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="deleteCode" className="text-white text-sm">
                      Verification code
                    </Label>
                    <Input
                      id="deleteCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter 6-digit code"
                      value={deleteCode}
                      onChange={(e) => setDeleteCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      className="bg-white/10 border-white/20 text-white font-mono text-lg tracking-widest"
                    />
                    <p className="text-white/50 text-xs">
                      Code expires in 5 minutes. <button type="button" onClick={handleRequestDeleteCode} disabled={deleteSendLoading} className="text-red-300 hover:underline">Resend</button>
                    </p>
                  </div>
                  {deleteError && <p className="text-red-400 text-sm">{deleteError}</p>}
                </>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={closeDeleteDialog}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Cancel
              </Button>
              {deleteStep === "code_sent" && (
                <Button
                  type="button"
                  onClick={handleConfirmDeleteAccount}
                  disabled={deleteCode.length !== 6 || deleteConfirmLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteConfirmLoading ? "Deleting..." : "Permanently delete my account"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  )
}
