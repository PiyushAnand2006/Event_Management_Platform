'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  MapPin,
  Tag,
  Armchair,
  CheckCircle2,
  Download,
  XCircle,
  ShieldCheck,
  Loader2,
  CalendarPlus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TicketData = {
  id: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  eventType: string
  guestName: string
  tier: string
  seatLabel: string | null
  barcodeUrl: string | null
  qrUrl: string | null
  status: 'issued' | 'sent' | 'opened' | 'checked_in' | 'revoked'
}

const statusConfig: Record<string, { label: string; className: string }> = {
  issued: { label: 'Issued', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  opened: { label: 'Opened', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  checked_in: { label: 'Checked In', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  revoked: { label: 'Revoked', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

const tierConfig: Record<string, { label: string; className: string }> = {
  vip: { label: 'VIP', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300' },
  reserved: { label: 'Reserved', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300' },
  general: { label: 'General', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-400' },
}

function generateICS(event: { title: string; date: string; location: string }) {
  const dateObj = new Date(event.date)
  const endDate = new Date(dateObj.getTime() + 3 * 60 * 60 * 1000) // default 3 hours
  const pad = (n: number) => n.toString().padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Occasio//Ticket//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(dateObj)}`,
    `DTEND:${fmt(endDate)}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `occasio-${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function TicketPage() {
  const params = useParams<{ invitationId: string }>()
  const invitationId = params.invitationId

  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [imgErrors, setImgErrors] = useState<{ barcode: boolean; qr: boolean }>({ barcode: false, qr: false })

  useEffect(() => {
    if (!invitationId) return
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/ticket/${invitationId}`)
        if (!res.ok) {
          setNotFound(true)
          return
        }
        const data = await res.json()
        setTicket(data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchTicket()
  }, [invitationId])

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center" style={{ background: '#f5f5f5' }}>
        <div className="w-full max-w-md mx-auto p-6">
          <Skeleton className="h-6 w-48 mb-4 mx-auto" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (notFound || !ticket) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center" style={{ background: '#f5f5f5' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 p-6"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Ticket Not Found</h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            This invitation link is invalid, expired, or has been revoked. Please contact the event organizer.
          </p>
        </motion.div>
      </div>
    )
  }

  const statusCfg = statusConfig[ticket.status] || statusConfig.issued
  const tierCfg = tierConfig[ticket.tier] || tierConfig.general
  const isRevoked = ticket.status === 'revoked'
  const isCheckedIn = ticket.status === 'checked_in'
  const formattedDate = new Date(ticket.eventDate).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="min-h-[80vh] py-6 px-4" style={{ background: '#f5f5f5' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="max-w-md mx-auto"
      >
        {/* Wallet-Style Card */}
        <div
          className={cn(
            'relative bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden',
            isRevoked && 'opacity-70'
          )}
        >
          {/* Checked-in overlay */}
          {isCheckedIn && (
            <div className="absolute inset-0 bg-orange-500/10 z-10 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-orange-500/20 backdrop-blur-sm flex items-center justify-center"
              >
                <CheckCircle2 className="h-10 w-10 text-orange-600" strokeWidth={3} />
              </motion.div>
            </div>
          )}

          {/* Header Section — Event Info */}
          <div className="px-5 pt-5 pb-4">
            <h1 className="text-lg font-bold text-foreground leading-tight mb-3">
              {ticket.eventTitle}
            </h1>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-orange-600 shrink-0" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-600 shrink-0" />
                <span className="truncate">{ticket.eventLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-orange-600 shrink-0" />
                <span className="capitalize">{ticket.eventType}</span>
              </div>
            </div>
          </div>

          {/* Dashed Divider */}
          <div className="px-5">
            <div className="border-t-2 border-dashed border-orange-400 dark:border-orange-600 relative">
              {/* Circle cutouts on divider */}
              <div className="absolute -left-8 -top-4 w-8 h-8 rounded-full" style={{ background: '#f5f5f5' }} />
              <div className="absolute -right-8 -top-4 w-8 h-8 rounded-full" style={{ background: '#f5f5f5' }} />
            </div>
          </div>

          {/* Guest Info Section */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-foreground">{ticket.guestName}</h2>
              <Badge variant="outline" className={tierCfg.className}>
                {tierCfg.label}
              </Badge>
            </div>
            {ticket.seatLabel && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Armchair className="h-3.5 w-3.5" />
                <span>Seat: {ticket.seatLabel}</span>
              </div>
            )}
          </div>

          {/* Barcode Section */}
          <div className="px-5 pb-3">
            {ticket.barcodeUrl && !imgErrors.barcode ? (
              <div className="flex justify-center py-2">
                <img
                  src={ticket.barcodeUrl}
                  alt="Ticket barcode"
                  className="h-16 w-full max-w-xs object-contain"
                  onError={() => setImgErrors((prev) => ({ ...prev, barcode: true }))}
                />
              </div>
            ) : (
              <div className="flex justify-center py-2">
                <div className="h-16 w-64 bg-gray-100 dark:bg-zinc-800 rounded flex items-center justify-center text-xs text-muted-foreground">
                  Barcode unavailable
                </div>
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className="px-5 pb-4">
            {ticket.qrUrl && !imgErrors.qr ? (
              <div className="flex justify-center py-2">
                <img
                  src={ticket.qrUrl}
                  alt="Ticket QR code"
                  className="h-32 w-32 object-contain rounded-lg"
                  onError={() => setImgErrors((prev) => ({ ...prev, qr: true }))}
                />
              </div>
            ) : (
              <div className="flex justify-center py-2">
                <div className="h-32 w-32 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                  QR unavailable
                </div>
              </div>
            )}
          </div>

          {/* Status + Action Row */}
          <div className="px-5 pb-5">
            <div className="flex items-center justify-between">
              <Badge className={statusCfg.className}>
                {statusCfg.label}
              </Badge>
              {!isRevoked && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  onClick={() =>
                    generateICS({
                      title: ticket.eventTitle,
                      date: ticket.eventDate,
                      location: ticket.eventLocation,
                    })
                  }
                >
                  <CalendarPlus className="h-3.5 w-3.5 mr-1.5" />
                  Add to Calendar
                </Button>
              )}
            </div>
          </div>

          {/* Occasio Branding Footer */}
          <div className="bg-orange-600 px-5 py-3 flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-white/90" />
            <span className="text-sm font-bold tracking-tight text-white">
              Occa<span className="text-white/90">sio</span>
            </span>
          </div>
        </div>

        {/* Help text below card */}
        <p className="text-center text-xs text-muted-foreground mt-4 px-4">
          Present this ticket at the entrance for scanning. Do not share your ticket link.
        </p>
      </motion.div>
    </div>
  )
}
