"use client"

import { useState } from "react"
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
  Settings,
  User,
  Bell,
  Calendar,
  Shield,
  Palette,
  Mail,
  Phone,
  Lock,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react"

export default function SettingsPage() {
  // Profile state
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    bio: "",
  })

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    followUpReminders: true,
    teamUpdates: true,
    clientUpdates: false,
    marketingEmails: false,
  })

  // Calendar integrations
  const [calendarIntegrations, setCalendarIntegrations] = useState({
    googleCalendar: false,
    appleCalendar: false,
    syncFrequency: "realtime", // realtime, hourly, daily
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: "team", // public, team, private
    showEmail: true,
    showPhone: true,
    allowTimeSlotRequests: true,
    shareAvailability: true,
  })

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "system", // light, dark, system
    defaultView: "week", // day, week, month
    compactMode: false,
    showWeekends: true,
  })

  const handleProfileUpdate = () => {
    // TODO: Implement profile update API call
    alert("Profile updated successfully!")
  }

  const handleConnectGoogle = () => {
    // TODO: Implement Google Calendar OAuth
    setCalendarIntegrations({ ...calendarIntegrations, googleCalendar: true })
    alert("Google Calendar connected successfully!")
  }

  const handleConnectApple = () => {
    // TODO: Implement Apple Calendar integration
    setCalendarIntegrations({ ...calendarIntegrations, appleCalendar: true })
    alert("Apple Calendar connected successfully!")
  }

  const handleDisconnectGoogle = () => {
    setCalendarIntegrations({ ...calendarIntegrations, googleCalendar: false })
    alert("Google Calendar disconnected.")
  }

  const handleDisconnectApple = () => {
    setCalendarIntegrations({ ...calendarIntegrations, appleCalendar: false })
    alert("Apple Calendar disconnected.")
  }

  const handleExportData = () => {
    // TODO: Implement data export
    alert("Data export initiated. You will receive an email when it's ready.")
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // TODO: Implement account deletion
      alert("Account deletion requested. You will receive a confirmation email.")
    }
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
            <TabsTrigger value="appearance" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-white/20 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-white/70">
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title" className="text-white">
                      Job Title
                    </Label>
                    <Input
                      id="title"
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="Insurance Agent"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio" className="text-white">
                      Bio
                    </Label>
                    <textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="flex min-h-[80px] w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleProfileUpdate}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="border-white/20 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Security
                </CardTitle>
                <CardDescription className="text-white/70">Manage your password and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-white">
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">Update Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-white/20 bg-white/5 backdrop-blur-sm">
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

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketingEmails" className="text-white">
                        Marketing Emails
                      </Label>
                      <p className="text-sm text-white/60">Receive promotional emails and updates</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, marketingEmails: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card className="border-white/20 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Calendar Integrations
                </CardTitle>
                <CardDescription className="text-white/70">
                  Connect your external calendars to sync events automatically
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
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleConnectGoogle}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      Connect
                    </Button>
                  )}
                </div>

                {/* Apple Calendar */}
                <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Apple Calendar</h3>
                      <p className="text-sm text-white/60">
                        {calendarIntegrations.appleCalendar ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  {calendarIntegrations.appleCalendar ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <Button
                        variant="outline"
                        onClick={handleDisconnectApple}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleConnectApple}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      Connect
                    </Button>
                  )}
                </div>

                <Separator className="bg-white/10" />

                {/* Sync Frequency */}
                <div className="space-y-2">
                  <Label className="text-white">Sync Frequency</Label>
                  <select
                    value={calendarIntegrations.syncFrequency}
                    onChange={(e) =>
                      setCalendarIntegrations({ ...calendarIntegrations, syncFrequency: e.target.value })
                    }
                    className="flex h-9 w-full rounded-md border border-white/20 bg-white/10 px-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                  </select>
                  <p className="text-xs text-white/60">How often should we sync your calendar events?</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-white/20 bg-white/5 backdrop-blur-sm">
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

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-white/20 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Appearance Settings
                </CardTitle>
                <CardDescription className="text-white/70">Customize how the application looks and behaves</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Theme</Label>
                    <select
                      value={appearance.theme}
                      onChange={(e) => setAppearance({ ...appearance, theme: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-white/20 bg-white/10 px-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-2">
                    <Label className="text-white">Default Calendar View</Label>
                    <select
                      value={appearance.defaultView}
                      onChange={(e) => setAppearance({ ...appearance, defaultView: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-white/20 bg-white/10 px-3 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                    >
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                    </select>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compactMode" className="text-white">
                        Compact Mode
                      </Label>
                      <p className="text-sm text-white/60">Use a more compact layout</p>
                    </div>
                    <Switch
                      id="compactMode"
                      checked={appearance.compactMode}
                      onCheckedChange={(checked) => setAppearance({ ...appearance, compactMode: checked })}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showWeekends" className="text-white">
                        Show Weekends
                      </Label>
                      <p className="text-sm text-white/60">Display weekends in calendar views</p>
                    </div>
                    <Switch
                      id="showWeekends"
                      checked={appearance.showWeekends}
                      onCheckedChange={(checked) => setAppearance({ ...appearance, showWeekends: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription className="text-white/70">Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Export Data</h3>
                <p className="text-sm text-white/60">Download all your data in a portable format</p>
              </div>
              <Button
                variant="outline"
                onClick={handleExportData}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-400">Delete Account</h3>
                <p className="text-sm text-white/60">Permanently delete your account and all associated data</p>
              </div>
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
