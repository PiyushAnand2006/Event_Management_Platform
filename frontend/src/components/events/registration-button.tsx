'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Check, Clock, LogIn, Ban, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

interface RegistrationButtonProps {
  eventId: string
  isRegistered: boolean
  isWaitlisted: boolean
  isFull: boolean
  isAuthenticated: boolean
  isApproved: boolean
  onRegister: () => void
  onCancel: () => void
}

export function RegistrationButton({
  eventId,
  isRegistered,
  isWaitlisted,
  isFull,
  isAuthenticated,
  isApproved,
  onRegister,
  onCancel,
}: RegistrationButtonProps) {
  const [registering, setRegistering] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
        <Link href="/login">
          <LogIn className="h-4 w-4 mr-2" />
          Log in to Register
        </Link>
      </Button>
    )
  }

  // Event not approved
  if (!isApproved) {
    return (
      <Button variant="outline" size="lg" className="w-full sm:w-auto" disabled>
        <Ban className="h-4 w-4 mr-2" />
        Registration Unavailable
      </Button>
    )
  }

  // Already registered
  if (isRegistered) {
    return (
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="border-orange-500/50 text-orange-600 dark:text-orange-400 bg-orange-500/10 px-4 py-2.5 text-sm font-medium gap-1.5"
        >
          <Check className="h-4 w-4" />
          Registered
        </Badge>
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your registration? If this was a paid event,
                a refund will be processed based on our refund policy. The refund amount depends
                on how close the cancellation is to the event date.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Registration</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={async () => {
                  setCancelling(true)
                  try {
                    await onCancel()
                    setShowCancelDialog(false)
                  } finally {
                    setCancelling(false)
                  }
                }}
                disabled={cancelling}
              >
                {cancelling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Yes, Cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // Waitlisted
  if (isWaitlisted) {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 px-4 py-2.5 text-sm font-medium gap-1.5">
        <Clock className="h-4 w-4" />
        Waitlisted
      </Badge>
    )
  }

  // Event Full
  if (isFull) {
    return (
      <Button variant="outline" size="lg" className="w-full sm:w-auto" disabled>
        Event Full
      </Button>
    )
  }

  // Register
  return (
    <Button
      size="lg"
      className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
      onClick={async () => {
        setRegistering(true)
        try {
          await onRegister()
        } finally {
          setRegistering(false)
        }
      }}
      disabled={registering}
    >
      {registering && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      Register Now
    </Button>
  )
}
