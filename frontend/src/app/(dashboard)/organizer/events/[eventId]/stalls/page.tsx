'use client'

import React, { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusCircle,
  Search,
  Store,
  ChevronLeft,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import StallCard, { type StallData } from '@/components/stalls/stall-card'
import StallForm from '@/components/stalls/stall-form'
import BackupVendorPanel from '@/components/stalls/backup-vendor-panel'

type EventData = {
  id: string
  title: string
}

const statusFilters = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined', label: 'Declined' },
]

export default function StallsPage() {
  const params = useParams<{ eventId: string }>()
  const eventId = params.eventId

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingStall, setEditingStall] = useState<StallData | null>(null)
  const [backupStall, setBackupStall] = useState<StallData | null>(null)
  const [backupSheetOpen, setBackupSheetOpen] = useState(false)

  // Fetch event info
  const { data: eventData } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`)
      const json = await res.json()
      if (!json.success) throw new Error('Failed to fetch event')
      return json.data as EventData
    },
  })

  // Fetch stalls
  const {
    data: stallsData = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['stalls', eventId, statusFilter],
    queryFn: async () => {
      const url =
        statusFilter !== 'all'
          ? `/api/events/${eventId}/stalls?status=${statusFilter}`
          : `/api/events/${eventId}/stalls`
      const res = await fetch(url)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to fetch stalls')
      return (json.data || []) as StallData[]
    },
  })

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!search) return stallsData
    const q = search.toLowerCase()
    return stallsData.filter(
      (s) =>
        s.ownerName.toLowerCase().includes(q) ||
        (s.cuisineType || '').toLowerCase().includes(q)
    )
  }, [stallsData, search])

  function handleEdit(stall: StallData) {
    setEditingStall(stall)
    setFormOpen(true)
  }

  function handleFormSuccess() {
    setFormOpen(false)
    setEditingStall(null)
    refetch()
  }

  function handleFormCancel() {
    setFormOpen(false)
    setEditingStall(null)
  }

  function handleOpenBackups(stall: StallData) {
    setBackupStall(stall)
    setBackupSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" asChild>
            <Link href="/organizer/events">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
              <Store className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              Stalls & Vendors
            </h1>
            {eventData && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {eventData.title}
              </p>
            )}
          </div>
        </div>
        <Button
          className="bg-orange-600 hover:bg-orange-700 text-white"
          onClick={() => setFormOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Stall
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by owner or cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed rounded-xl py-16 text-center">
          <Store className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            No food stalls added yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Click "Add Stall" to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((stall, i) => (
              <motion.div
                key={stall.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: i * 0.04 }}
              >
                <StallCardWrapper
                  stall={stall}
                  eventId={eventId}
                  onEdit={handleEdit}
                  onDeleted={refetch}
                  onDeclined={refetch}
                  onOpenBackups={handleOpenBackups}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) handleFormCancel()
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStall ? 'Edit Stall' : 'Add New Stall'}
            </DialogTitle>
            <DialogDescription>
              {editingStall
                ? 'Update the stall details below.'
                : 'Add a new food stall, beverage vendor, or service provider to your event.'}
            </DialogDescription>
          </DialogHeader>
          <StallForm
            eventId={eventId}
            stall={editingStall || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Backup Vendor Sheet */}
      <Sheet open={backupSheetOpen} onOpenChange={setBackupSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Backup Vendors</SheetTitle>
            <SheetDescription>
              Manage backup vendors for {backupStall?.ownerName}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            {backupStall && (
              <BackupVendorPanel
                eventId={eventId}
                stallId={backupStall.id}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/**
 * Wrapper around StallCard that adds a "Backups" button to open the backup vendor sheet.
 */
function StallCardWrapper({
  stall,
  eventId,
  onEdit,
  onDeleted,
  onDeclined,
  onOpenBackups,
}: {
  stall: StallData
  eventId: string
  onEdit: (stall: StallData) => void
  onDeleted: () => void
  onDeclined: () => void
  onOpenBackups: (stall: StallData) => void
}) {
  const backupCount = stall.backupVendors?.length || 0

  return (
    <div className="relative">
      <StallCard
        stall={stall}
        eventId={eventId}
        onEdit={onEdit}
        onDeleted={onDeleted}
        onDeclined={onDeclined}
      />
      {/* Floating backup button */}
      {stall.contractStatus === 'declined' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenBackups(stall)}
          className="absolute top-3 right-3 gap-1 text-xs text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 z-10"
        >
          <Store className="h-3 w-3" />
          Backups
          {backupCount > 0 && (
            <span className="ml-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full px-1.5 text-[10px]">
              {backupCount}
            </span>
          )}
        </Button>
      )}
    </div>
  )
}
