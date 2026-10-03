'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ScanLine,
  UserCheck,
  Users,
  Loader2,
  CameraOff,
  Wifi,
  RotateCw,
  QrCode,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-16">
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
  const [scannerError, setScannerError] = useState<string | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [simulatedCode, setSimulatedCode] = useState('')

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/checkin/${eventId}/stats`)
      if (res.ok) {
        const json = await res.json()
        setStats(json.data ?? json)
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

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!simulatedCode.trim()) return
    handleScanResult(simulatedCode.trim())
    setSimulatedCode('')
  }

  // Auto-dismiss the scan result panel after a few seconds
  useEffect(() => {
    if (!lastResult) return
    const timer = setTimeout(() => setLastResult(null), 6000)
    return () => clearTimeout(timer)
  }, [lastResult])

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
    <div className="flex flex-col gap-4">
      {/* Top Bar */}
      <div className="flex items-center gap-3 bg-card rounded-xl border border-border/70 p-3 shadow-xs sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ScanLine className="h-5 w-5 text-orange-600 shrink-0" />
          <h1 className="text-base sm:text-lg font-semibold truncate text-foreground">{eventName}</h1>
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
      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left/Main Panel: Scanner or Camera Unavailable Simulation */}
        <div className="flex-1 min-h-[450px]">
          <Card className="h-full overflow-hidden border-2 border-dashed border-orange-200 dark:border-orange-900/50 flex flex-col justify-center">
            <CardContent className="p-6 h-full min-h-[400px] flex flex-col justify-center relative">
              {scannerError ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 text-muted-foreground max-w-md mx-auto py-8">
                  <div className="rounded-full bg-red-100 dark:bg-red-950/40 p-5">
                    <CameraOff className="h-10 w-10 text-red-500" />
                  </div>

                  <div className="text-center space-y-1.5">
                    <h3 className="text-lg font-bold text-foreground">Camera Not Available</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Camera permissions are disabled or no webcam is detected. You can use the search panel or enter a QR payload below to check in guests.
                    </p>
                    {scannerError && (
                      <p className="text-xs text-muted-foreground/70 font-mono break-words">{scannerError}</p>
                    )}
                  </div>

                  {/* QR Code Simulation Bar */}
                  <form onSubmit={handleSimulatedSubmit} className="w-full space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Paste or type QR barcode payload..."
                          value={simulatedCode}
                          onChange={(e) => setSimulatedCode(e.target.value)}
                          className="pl-9 text-sm"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={!simulatedCode.trim()}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer shrink-0"
                      >
                        Check In
                      </Button>
                    </div>
                  </form>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScannerError(null)}
                      className="rounded-full cursor-pointer"
                    >
                      <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                      Retry Camera
                    </Button>
                  </div>
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                      <p className="text-sm">Initializing scanner…</p>
                    </div>
                  }
                >
                  <CheckInScanner
                    onScan={handleScanResult}
                    onError={(message) => setScannerError(message)}
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
                    className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-20"
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
                <Search className="h-4 w-4 text-orange-600" />
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
        </div>
      </div>
    </div>
  )
}
