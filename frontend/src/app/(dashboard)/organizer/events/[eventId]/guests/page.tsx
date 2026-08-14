'use client'

import React, { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Users,
  Send,
  Upload,
  Mail,
  MailCheck,
  Clock,
  UserCheck,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import InvitationTable from '@/components/invitations/InvitationTable'
import BulkSendModal from '@/components/invitations/BulkSendModal'
import CSVUploadForm from '@/components/invitations/CSVUploadForm'

type CheckInStats = {
  total: number
  checkedIn: number
  pending: number
  sent: number
}

type EventData = {
  title: string
  name?: string
}

export default function OrganizerGuestsPage() {
  const params = useParams<{ eventId: string }>()
  const eventId = params.eventId
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('invitations')
  const [showBulkSend, setShowBulkSend] = useState(false)

  // Fetch event title
  const {
    data: eventData,
    isLoading: loadingEvent,
  } = useQuery<EventData>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`)
      if (!res.ok) throw new Error('Failed to fetch event')
      return res.json()
    },
    enabled: !!eventId,
  })

  const eventName = eventData?.title || eventData?.name || 'Event'

  // Fetch check-in stats
  const {
    data: stats,
    isLoading: loadingStats,
  } = useQuery<CheckInStats>({
    queryKey: ['checkin-stats', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/checkin/${eventId}/stats`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    enabled: !!eventId,
  })

  // Fetch invitations
  const {
    data: invitations,
    isLoading: loadingInvitations,
    refetch: refetchInvitations,
  } = useQuery({
    queryKey: ['invitations', eventId, statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchQuery) params.set('search', searchQuery)
      const res = await fetch(`/api/events/${eventId}/invitations?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch invitations')
      const data = await res.json()
      return Array.isArray(data.data?.invitations)
        ? data.data.invitations
        : Array.isArray(data.invitations)
        ? data.invitations
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : []
    },
    enabled: !!eventId,
  })

  // Generate invitations mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/events/${eventId}/invitations/generate`, {
        method: 'POST',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to generate invitations')
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast({
        title: 'Invitations Generated',
        description: data.message || `${data.count || ''} invitations created successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: ['invitations', eventId] })
      queryClient.invalidateQueries({ queryKey: ['checkin-stats', eventId] })
    },
    onError: (err: Error) => {
      toast({
        title: 'Generation Failed',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const handleRefresh = useCallback(() => {
    refetchInvitations()
    queryClient.invalidateQueries({ queryKey: ['checkin-stats', eventId] })
  }, [refetchInvitations, queryClient, eventId])

  const tabVariants = {
    enter: { opacity: 0, x: 10 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  }

  const statCards = [
    {
      label: 'Total Invited',
      value: stats?.total ?? 0,
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'Sent',
      value: stats?.sent ?? 0,
      icon: Send,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Checked In',
      value: stats?.checkedIn ?? 0,
      icon: UserCheck,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'Pending',
      value: stats?.pending ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">{eventName}</h1>
            <p className="text-sm text-muted-foreground">Guest Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loadingInvitations}
          >
            <RefreshCw className={cn('h-4 w-4 mr-1.5', loadingInvitations && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-1.5" />
            )}
            Generate Invitations
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-lg p-2', stat.bg)}>
                    <Icon className={cn('h-4 w-4', stat.color)} />
                  </div>
                  <div>
                    {loadingStats ? (
                      <Skeleton className="h-7 w-10" />
                    ) : (
                      <p className="text-2xl font-bold">{stat.value}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="invitations" className="gap-1.5">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Invitations</span>
          </TabsTrigger>
          <TabsTrigger value="send" className="gap-1.5">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-1.5">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import CSV</span>
          </TabsTrigger>
        </TabsList>

        {/* Invitations Tab */}
        <TabsContent value="invitations">
          <motion.div
            key="invitations"
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by guest name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                {loadingInvitations ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <InvitationTable
                    invitations={invitations || []}
                    onRefresh={handleRefresh}
                    eventId={eventId}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Send Tab */}
        <TabsContent value="send">
          <motion.div
            key="send"
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MailCheck className="h-5 w-5 text-orange-600" />
                  Send Invitations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BulkSendModal
                  eventId={eventId}
                  onSent={handleRefresh}
                />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Import CSV Tab */}
        <TabsContent value="import">
          <motion.div
            key="import"
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-orange-600" />
                  Import Guest List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CSVUploadForm
                  eventId={eventId}
                  onSuccess={handleRefresh}
                />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
