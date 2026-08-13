'use client'

import { format } from 'date-fns'
import { Download, X, QrCode, MapPin, CalendarDays, User, Mail, Ticket, ShieldCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface TicketDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registration: {
    id: string
    eventId: string
    status: string
    tier: string
    qrCodeDataUrl?: string | null
    createdAt: string
  }
  event: {
    title: string
    date: string
    location: string
    posterUrl?: string | null
  }
  user: {
    name: string
    email: string
  }
}

const statusStyles: Record<string, string> = {
  registered: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  waitlisted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  attended: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
}

const statusLabels: Record<string, string> = {
  registered: 'Registered',
  waitlisted: 'Waitlisted',
  attended: 'Attended',
  cancelled: 'Cancelled',
}

export function TicketDetailModal({
  open,
  onOpenChange,
  registration,
  event,
  user,
}: TicketDetailModalProps) {
  const isAttended = registration.status === 'attended'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-orange-600" />
            Ticket Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed view of your event registration and ticket information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Event Poster + Title */}
          <div className="flex gap-4">
            {event.posterUrl ? (
              <img
                src={event.posterUrl}
                alt={event.title}
                className="h-20 w-28 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="h-20 w-28 rounded-lg bg-gradient-to-br from-orange-500 to-amber-800 shrink-0 flex items-center justify-center">
                <CalendarDays className="h-8 w-8 text-white/40" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-snug line-clamp-2">
                {event.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {format(new Date(event.date), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Registration Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Registration ID</span>
              <p className="font-mono text-xs break-all bg-muted px-2 py-1 rounded">{registration.id}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Status</span>
              <div>
                <Badge
                  className={cn(
                    'text-xs',
                    statusStyles[registration.status] || statusStyles.registered
                  )}
                >
                  {statusLabels[registration.status] || registration.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Tier</span>
              <p className="capitalize font-medium">{registration.tier}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Registered On</span>
              <p>{format(new Date(registration.createdAt), 'MMM d, yyyy')}</p>
            </div>
          </div>

          {/* Attendee Info */}
          <div className="space-y-2 text-sm">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Attendee</span>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user.email}</span>
            </div>
          </div>

          <Separator />

          {/* QR Code Placeholder */}
          <div className="flex flex-col items-center gap-2 py-4">
            {registration.qrCodeDataUrl ? (
              <img
                src={registration.qrCodeDataUrl}
                alt="QR Code"
                className="h-48 w-48 rounded-lg border"
              />
            ) : (
              <div className="h-48 w-48 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30">
                <QrCode className="h-12 w-12 text-muted-foreground/40 mb-2" />
                <span className="text-xs text-muted-foreground">QR Code</span>
                <span className="text-xs text-muted-foreground/70">Generated after approval</span>
              </div>
            )}
          </div>

          {/* Actions */}
          {isAttended && (
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              <ShieldCheck className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          )}

          {registration.status === 'registered' && (
            <Button variant="outline" className="w-full text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10">
              <X className="h-4 w-4 mr-2" />
              Cancel Registration
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
