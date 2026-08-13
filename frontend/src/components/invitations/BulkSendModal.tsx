'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type BulkSendModalProps = {
  eventId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

type SendMode = 'unsent' | 'selected'

type SendResult = {
  sent: number
  failed: number
}

export default function BulkSendModal({
  eventId,
  open,
  onOpenChange,
  onComplete,
}: BulkSendModalProps) {
  const [mode, setMode] = useState<SendMode>('unsent')
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<SendResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resetState = useCallback(() => {
    setSending(false)
    setProgress(0)
    setResult(null)
    setError(null)
    setMode('unsent')
  }, [])

  async function handleStart() {
    setSending(true)
    setProgress(0)
    setResult(null)
    setError(null)

    try {
      const res = await fetch(
        `/api/events/${eventId}/invitations/send`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode }),
        }
      )

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send invitations')
      }

      // Simulate progress for visual feedback
      // Real progress could come from SSE or polling
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 150))
        setProgress(i)
      }

      const data = await res.json()
      setResult({
        sent: data.sent ?? data.count ?? 0,
        failed: data.failed ?? 0,
      })
      onComplete?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
      setProgress(0)
    } finally {
      setSending(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetState()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Send Invitations</DialogTitle>
          <DialogDescription>
            Send invitation emails to your guest list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Send mode selection */}
          {!sending && !result && !error && (
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as SendMode)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="unsent" id="mode-unsent" />
                <Label htmlFor="mode-unsent" className="flex-1 cursor-pointer">
                  <p className="text-sm font-medium">Send all unsent</p>
                  <p className="text-xs text-muted-foreground">
                    Send to all guests who haven&apos;t received an email yet
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="selected" id="mode-selected" />
                <Label htmlFor="mode-selected" className="flex-1 cursor-pointer">
                  <p className="text-sm font-medium">Send selected</p>
                  <p className="text-xs text-muted-foreground">
                    Only invitations selected in the table
                  </p>
                </Label>
              </div>
            </RadioGroup>
          )}

          {/* Progress */}
          {sending && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                <span>Sending invitations...</span>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Progress
                  value={progress}
                  className="h-2 [&>div]:bg-orange-500"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right tabular-nums">
                  {progress}%
                </p>
              </motion.div>
            </div>
          )}

          {/* Result summary */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-lg border p-4 space-y-2',
                result.failed === 0
                  ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30'
                  : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
              )}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                  Sending Complete
                </p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold text-orange-700 dark:text-orange-300">
                  {result.sent}
                </span>{' '}
                sent
                {result.failed > 0 && (
                  <>,{' '}
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {result.failed}
                  </span>{' '}
                  failed</>
                )}
              </p>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!result && !sending && (
            <Button onClick={handleStart} className="gap-2">
              <Send className="h-4 w-4" />
              Start Sending
            </Button>
          )}
          {(result || error) && (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
