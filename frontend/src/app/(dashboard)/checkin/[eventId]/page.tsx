'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ScanLine,
  UserCheck,
  UserX,
  Users,
  Loader2,
  CameraOff,
  CheckCircle2,
  XCircle,
  Wifi,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import ManualSearchPanel from '@/components/checkin/ManualSearchPanel'
import CheckInStatsPanel from '@/components/checkin/CheckInStatsPanel'
import CheckInResult from '@/components/checkin/CheckInResult'

const CheckInScanner = dynamic(
  () => import('@/components/checkin/CheckInScanner'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm">Loading scanner…</p>
      </div>
    ),
  }
)

type CheckInResultData = {
  success: boolean
  guestName?: string
  tier?: string
  seatLabel?: string
  reason?: string
}

type CheckInStats = {
  total: number
  checkedIn: number
  pending: number
}

export default function CheckinPage() {
  const params = useParams<{ eventId: string }>()
  const eventId = params.eventId
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [eventName, setEventName] = useState<string>('')
  const [stats, setStats] = useState<CheckInStats>({ total: 0, checkedIn: 0, pending: 0 })
  const [lastResult, setLastResult] = useState<CheckInResultData | null>(null)
  const [scannerError, setScannerError] = useState<boolean>(false)
  const [loadingStats, setLoadingStats] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/checkin/${eventId}/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // silently fail for stats
    } finally {
      setLoadingStats(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`)
        if (res.ok) {
          const data = await res.json()
          setEventName(data.title || data.name || 'Event')
        }
      } catch {
        setEventName('Event')
      }
    }
    if (eventId) fetchEvent()
  }, [eventId])

  const handleScanResult = useCallback(
    async (barcodeData: string) => {
      try {
        const res = await fetch('/api/checkin/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode: barcodeData, eventId }),
        })
        const data = await res.json()
        setLastResult(data)
        if (data.success) {
          toast({ title: 'Guest checked in!', description: data.guestName })
        } else {
          toast({ title: 'Check-in failed', description: data.reason, variant: 'destructive' })
        }
        fetchStats()
      } catch {
        setLastResult({ success: false, reason: 'Network error. Please try again.' })
        toast({ title: 'Error', description: 'Failed to process scan', variant: 'destructive' })
      }
    },
    [eventId, toast, fetchStats]
  )

  const handleManualCheckin = useCallback(
    async (invitationId: string) => {
      try {
        const res = await fetch('/api/checkin/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invitationId, eventId }),
        })
        const data = await res.json()
        setLastResult(data)
        if (data.success) {
          toast({ title: 'Guest checked in!', description: data.guestName })
        } else {
          toast({ title: 'Check-in failed', description: data.reason, variant: 'destructive' })
        }
        fetchStats()
      } catch {
        setLastResult({ success: false, reason: 'Network error. Please try again.' })
        toast({ title: 'Error', description: 'Failed to process check-in', variant: 'destructive' })
      }
    },
    [eventId, toast, fetchStats]
  )

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (authStatus === 'unauthenticated' || !session) {
    router.push('/login')
    return null
  }

  return (
    <div className="flex flex-col gap-4 -m-4 sm:-m-6 lg:-m-8">
      {/* Top Bar */}
      <div className="flex items-center gap-3 bg-background border-b px-4 py-3 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ScanLine className="h-5 w-5 text-orange-600 shrink-0" />
          <h1 className="text-base sm:text-lg font-semibold truncate">{eventName}</h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Wifi className="h-4 w-4 text-orange-500" />
          <Badge
            variant="secondary"
            className={cn(
              'font-mono text-sm px-2.5 py-0.5',
              'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
            )}
          >
            <UserCheck className="h-3.5 w-3.5 mr-1" />
            {loadingStats ? (
              <Skeleton className="h-4 w-16 inline-block" />
            ) : (
              <span>{stats.checkedIn} / {stats.total}</span>
            )}
          </Badge>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* Left/Main Panel: Scanner */}
        <div className="flex-1 min-h-0">
          <Card className="h-full overflow-hidden border-2 border-dashed border-orange-200 dark:border-orange-800">
            <CardContent className="p-0 h-full min-h-[400px] lg:min-h-[500px] relative">
              {scannerError ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground p-6">
                  <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                    <CameraOff className="h-10 w-10 text-red-500" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-medium text-foreground">Camera Not Available</p>
                    <p className="text-sm">Please allow camera access or use the manual search panel.</p>
                  </div>
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                      <p className="text-sm">Initializing scanner…</p>
                    </div>
                  }
                >
                  <CheckInScanner
                    onScan={handleScanResult}
                    onError={() => setScannerError(true)}
                  />
                </Suspense>
              )}

              {/* Scan Result Overlay */}
              <AnimatePresence>
                {lastResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6"
                  >
                    <CheckInResult result={lastResult} onDismiss={() => setLastResult(null)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Manual Search + Stats */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                Manual Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ManualSearchPanel eventId={eventId} onCheckIn={handleManualCheckin} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-orange-600" />
                Check-in Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CheckInStatsPanel stats={stats} loading={loadingStats} />
            </CardContent>
          </Card>

          {/* Recent Result Card (Mobile-friendly) */}
          <AnimatePresence>
            {lastResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden"
              >
                <CheckInResult result={lastResult} onDismiss={() => setLastResult(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
