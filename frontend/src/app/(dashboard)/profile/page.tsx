'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  FileText,
  Star,
  Calendar,
  LogOut,
  Loader2,
  Pencil,
  Check,
  X,
  Sparkles,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  bio: string | null
  interests: string
  image: string | null
  points: number
  createdAt: string
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  organizer: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  customer: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  attendee: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800',
}

const SUGGESTED_INTERESTS = [
  'Technology', 'Music', 'Art', 'Business', 'Sports', 'Food',
  'Education', 'Health', 'Gaming', 'Photography', 'Travel', 'Science',
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editInterests, setEditInterests] = useState<string[]>([])

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/profile')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProfile(data)
      setEditName(data.name)
      setEditPhone(data.phone || '')
      setEditBio(data.bio || '')
      try {
        setEditInterests(JSON.parse(data.interests || '[]'))
      } catch {
        setEditInterests([])
      }
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router, fetchProfile])

  const toggleInterest = (interest: string) => {
    setEditInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  const handleSave = async () => {
    if (!editName.trim() || editName.trim().length < 2) {
      toast.error('Name must be at least 2 characters')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim() || null,
          bio: editBio.trim() || null,
          interests: editInterests,
        }),
      })

      if (!res.ok) throw new Error('Failed to update')

      const updated = await res.json()
      setProfile(updated)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (profile) {
      setEditName(profile.name)
      setEditPhone(profile.phone || '')
      setEditBio(profile.bio || '')
      try {
        setEditInterests(JSON.parse(profile.interests || '[]'))
      } catch {
        setEditInterests([])
      }
    }
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
    toast.success('Signed out successfully')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          {/* Avatar & Name Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar className="h-20 w-20 text-lg">
              <AvatarImage src={profile.image || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              {isEditing ? (
                <div className="space-y-2 w-full">
                  <Label htmlFor="editName">Name</Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={isSaving}
                    className="h-10"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{profile.email}</p>
                </>
              )}
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={cn('text-xs font-semibold capitalize', ROLE_COLORS[profile.role] || ROLE_COLORS.customer)}
                >
                  {profile.role}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email (always read-only) */}
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium mt-0.5 truncate">{profile.email}</p>
              </div>
            </div>

            {/* Phone */}
            {isEditing ? (
              <div className="flex flex-col gap-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
                </div>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  disabled={isSaving}
                  placeholder="Your phone number"
                  className="h-9 text-sm"
                />
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-medium mt-0.5">{profile.phone || 'Not set'}</p>
                </div>
              </div>
            )}

            {/* Points */}
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Points</p>
                <p className="text-lg font-bold mt-0.5 text-amber-600 dark:text-amber-400">{profile.points}</p>
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Joined</p>
                <p className="text-sm font-medium mt-0.5">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-4">
            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor="editBio" className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Bio
                </Label>
                <Textarea
                  id="editBio"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  disabled={isSaving}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            ) : (
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bio</p>
                </div>
                <p className="text-sm">{profile.bio || 'No bio yet. Click Edit to add one.'}</p>
              </div>
            )}
          </div>

          {/* Interests */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Interests</p>
            </div>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    disabled={isSaving}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-full border transition-all',
                      editInterests.includes(interest)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    )}
                  >
                    {editInterests.includes(interest) && '✓ '}{interest}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {editInterests.length > 0 ? (
                  editInterests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No interests selected yet.</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <LogOut className="h-4 w-4 text-destructive" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sign out</p>
              <p className="text-xs text-muted-foreground">End your current session</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5 gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
