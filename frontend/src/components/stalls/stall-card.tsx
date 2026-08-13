'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  UtensilsCrossed,
  Wine,
  Cake,
  Palette,
  Camera,
  Package,
  Phone,
  Pencil,
  XCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export type BackupVendorData = {
  id: string
  name: string
  phone?: string | null
  address?: string | null
  distanceKm: number
  source: string
  contactStatus: string
  promotedToStallId?: string | null
}

export type StallData = {
  id: string
  ownerName: string
  phone: string
  stallType: string
  cuisineType?: string | null
  contractStatus: string
  locationX?: number | null
  locationY?: number | null
  photoUrl?: string | null
  notes?: string | null
  backupVendors?: BackupVendorData[]
}

type StallCardProps = {
  stall: StallData
  eventId: string
  onEdit: (stall: StallData) => void
  onDeleted: () => void
  onDeclined: () => void
}

const stallTypeIcons: Record<string, React.ElementType> = {
  food: UtensilsCrossed,
  beverage: Wine,
  dessert: Cake,
  decor: Palette,
  photography: Camera,
  other: Package,
}

const stallTypeLabels: Record<string, string> = {
  food: 'Food',
  beverage: 'Beverage',
  dessert: 'Dessert',
  decor: 'Decor',
  photography: 'Photography',
  other: 'Other',
}

const statusConfig: Record<
  string,
  { className: string; label: string }
> = {
  pending: {
    className:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    label: 'Pending',
  },
  confirmed: {
    className:
      'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    label: 'Confirmed',
  },
  declined: {
    className:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    label: 'Declined',
  },
  cancelled: {
    className:
      'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700',
    label: 'Cancelled',
  },
}

const sourceBadgeClass: Record<string, string> = {
  overpass:
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  manual:
    'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
  google:
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
}

const contactStatusClass: Record<string, string> = {
  unverified:
    'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700',
  contacted:
    'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
  confirmed:
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
}

export default function StallCard({
  stall,
  eventId,
  onEdit,
  onDeleted,
  onDeclined,
}: StallCardProps) {
  const [showBackups, setShowBackups] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const IconComponent = stallTypeIcons[stall.stallType] || Package
  const status = statusConfig[stall.contractStatus] || statusConfig.pending

  const canDecline =
    stall.contractStatus === 'pending' || stall.contractStatus === 'confirmed'
  const backupCount = stall.backupVendors?.length || 0

  async function handleDecline() {
    setDeclining(true)
    try {
      const res = await fetch(
        `/api/events/${eventId}/stalls/${stall.id}/decline`,
        { method: 'POST' }
      )
      const json = await res.json()
      if (!json.success) {
        toast.error(json.error || 'Failed to decline vendor')
        return
      }
      toast.success('Vendor declined', {
        description: json.data?.message || 'Backup vendor search initiated.',
      })
      onDeclined()
    } catch {
      toast.error('Failed to decline vendor')
    } finally {
      setDeclining(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/events/${eventId}/stalls/${stall.id}`,
        { method: 'DELETE' }
      )
      const json = await res.json()
      if (!json.success) {
        toast.error(json.error || 'Failed to delete stall')
        return
      }
      toast.success('Stall deleted')
      onDeleted()
    } catch {
      toast.error('Failed to delete stall')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className="overflow-hidden border transition-colors hover:border-orange-200 dark:hover:border-orange-800">
        <CardContent className="p-4 space-y-3">
          {/* Top row: Icon + Name + Status */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30">
              <IconComponent className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm truncate">
                  {stall.ownerName}
                </h3>
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {stallTypeLabels[stall.stallType] || stall.stallType}
                </Badge>
                {stall.cuisineType && (
                  <span className="text-xs text-muted-foreground">
                    {stall.cuisineType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <a
              href={`tel:${stall.phone}`}
              className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
            >
              {stall.phone}
            </a>
          </div>

          {/* Notes */}
          {stall.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {stall.notes}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(stall)}
              className="gap-1 text-xs"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
            {canDecline && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDecline}
                disabled={declining}
                className="gap-1 text-xs text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/30"
              >
                <XCircle className="h-3 w-3" />
                Decline
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
            {backupCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowBackups(!showBackups)}
                className="ml-auto gap-1 text-xs text-muted-foreground"
              >
                {showBackups ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                Backups ({backupCount})
              </Button>
            )}
          </div>

          {/* Expandable backup vendors */}
          {showBackups && stall.backupVendors && stall.backupVendors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t pt-3 space-y-2"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Backup Vendors
              </p>
              {stall.backupVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex items-center gap-2 text-xs rounded-md bg-muted/50 p-2"
                >
                  <span className="font-medium flex-1 truncate">
                    {vendor.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${sourceBadgeClass[vendor.source] || ''}`}
                  >
                    {vendor.source}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${contactStatusClass[vendor.contactStatus] || ''}`}
                  >
                    {vendor.contactStatus}
                  </Badge>
                  {vendor.promotedToStallId && (
                    <Badge className="bg-orange-600 text-white text-[10px] px-1.5 py-0">
                      Promoted
                    </Badge>
                  )}
                  {vendor.distanceKm > 0 && (
                    <span className="text-muted-foreground">
                      {vendor.distanceKm.toFixed(1)} km
                    </span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
