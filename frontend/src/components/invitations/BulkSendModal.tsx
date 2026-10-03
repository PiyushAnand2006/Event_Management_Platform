'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2, CheckCircle, AlertCircle, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type BulkSendModalProps = {
  eventId: string
  onSent?: () => void
}

type SendResult = {
  sent: number
  failed: number
}

export default function BulkSendModal({
  eventId,
  onSent,
}: BulkSendModalProps) {
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<SendResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    setSending(true)
    setProgress(0)
    setResult(null)
    setError(null)

    try {
      // Empty invitationIds means "send every invitation that is still issued"
      const res = await fetch(`/api/events/${eventId}/invitations/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationIds: [] }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send invitations')
      }

      const json = await res.json()
      const data = json.data ?? json

      // Simulated progress for visual feedback
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 120))
        setProgress(i)
      }

      setResult({
        sent: data.sent ?? 0,
        failed: data.failed ?? 0,
      })
      onSent?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
      setProgress(0)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
        <MailCheck className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Email every guest whose invitation is still <span className="capitalize">issued</span>
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Each email carries the guest&apos;s personal ticket link with their QR code.
            Without SMTP configured the send is mocked and logged server-side, but the
            invitation status still advances to <span className="font-medium">sent</span>.
          </p>
        </div>
      </div>

      <Button
        onClick={handleSend}
        disabled={sending}
        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold cursor-pointer"
      >
        {sending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending invitations...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Invitations
          </>
        )}
      </Button>

      {sending && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <Progress value={progress} className="h-2 [&>div]:bg-orange-500" />
          <p className="text-xs text-muted-foreground text-right tabular-nums">{progress}%</p>
        </motion.div>
      )}

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
            <span className="font-bold text-orange-700 dark:text-orange-300">{result.sent}</span>{' '}
            sent
            {result.failed > 0 && (
              <>
                ,{' '}
                <span className="font-bold text-red-600 dark:text-red-400">{result.failed}</span>{' '}
                failed
              </>
            )}
          </p>
        </motion.div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
