'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface AutoAssignButtonProps {
  eventId: string
  venueId: string
  onAssigned: () => void
}

export default function AutoAssignButton({ eventId, venueId, onAssigned }: AutoAssignButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/seat-assignment/auto`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!json.success) {
        toast.error(json.error || 'Auto-assignment failed')
        return
      }
      const { assigned, unassigned } = json.data as { assigned: number; unassigned: number }
      toast.success(`Auto-assignment complete`, {
        description: assigned > 0
          ? `${assigned} guest${assigned > 1 ? 's' : ''} assigned${unassigned > 0 ? `, ${unassigned} could not be seated` : ''}`
          : 'No guests needed assignment.',
      })
      setOpen(false)
      onAssigned()
    } catch {
      toast.error('Failed to auto-assign seats')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/30">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Auto-Assign Seats</span>
          <span className="sm:hidden">Auto</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Auto-Assign Seats</AlertDialogTitle>
          <AlertDialogDescription>
            This will assign all unassigned guests to available seats. Locked seats will be skipped. Continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-600"
          >
            {loading ? (
              <motion.span
                className="inline-flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Assigning...
              </motion.span>
            ) : (
              'Assign Seats'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
