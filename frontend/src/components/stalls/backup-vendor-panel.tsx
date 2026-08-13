'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus,
  ArrowUpCircle,
  Loader2,
  Phone,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

type BackupVendor = {
  id: string
  name: string
  phone?: string | null
  address?: string | null
  distanceKm: number
  source: string
  contactStatus: string
  promotedToStallId?: string | null
}

type BackupVendorPanelProps = {
  eventId: string
  stallId: string
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

export default function BackupVendorPanel({
  eventId,
  stallId,
}: BackupVendorPanelProps) {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [promoteVendor, setPromoteVendor] = useState<BackupVendor | null>(
    null
  )
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    address: '',
    distanceKm: '',
  })

  const {
    data: vendors = [],
    isLoading,
  } = useQuery({
    queryKey: ['backup-vendors', stallId],
    queryFn: async () => {
      const res = await fetch(
        `/api/events/${eventId}/stalls/${stallId}/backup-vendors`
      )
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to fetch')
      return (json.data || []) as BackupVendor[]
    },
  })

  const addMutation = useMutation({
    mutationFn: async (data: typeof addForm) => {
      const res = await fetch(
        `/api/events/${eventId}/stalls/${stallId}/backup-vendors`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            phone: data.phone || null,
            address: data.address || null,
            distanceKm: parseFloat(data.distanceKm) || 0,
          }),
        }
      )
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to add vendor')
      return json.data
    },
    onSuccess: () => {
      toast.success('Backup vendor added')
      setAddForm({ name: '', phone: '', address: '', distanceKm: '' })
      setShowAddForm(false)
      queryClient.invalidateQueries({ queryKey: ['backup-vendors', stallId] })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const promoteMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const res = await fetch(`/api/backup-vendors/${vendorId}/promote`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to promote')
      return json.data
    },
    onSuccess: () => {
      toast.success('Vendor promoted', {
        description: 'A new stall has been created for this vendor.',
      })
      setPromoteVendor(null)
      queryClient.invalidateQueries({ queryKey: ['backup-vendors', stallId] })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const contactMutation = useMutation({
    mutationFn: async ({
      vendorId,
      contactStatus,
    }: {
      vendorId: string
      contactStatus: string
    }) => {
      const res = await fetch(`/api/backup-vendors/${vendorId}/contact`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactStatus }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to update')
      return json.data
    },
    onSuccess: () => {
      toast.success('Contact status updated')
      queryClient.invalidateQueries({ queryKey: ['backup-vendors', stallId] })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {vendors.length} backup vendor{vendors.length !== 1 ? 's' : ''}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-1.5 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add Manual Vendor
        </Button>
      </div>

      {/* Add vendor inline form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border rounded-lg p-4 space-y-3 bg-muted/30"
          >
            <p className="text-sm font-medium">Add Manual Vendor</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="bv-name" className="text-xs">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bv-name"
                  placeholder="Vendor name"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bv-phone" className="text-xs">
                  Phone
                </Label>
                <Input
                  id="bv-phone"
                  placeholder="Phone number"
                  value={addForm.phone}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bv-address" className="text-xs">
                  Address
                </Label>
                <Input
                  id="bv-address"
                  placeholder="Address"
                  value={addForm.address}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bv-dist" className="text-xs">
                  Distance (km) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bv-dist"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={addForm.distanceKm}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, distanceKm: e.target.value }))
                  }
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                disabled={addMutation.isPending || !addForm.name.trim()}
                onClick={() => addMutation.mutate(addForm)}
              >
                {addMutation.isPending && (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                )}
                Add
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vendor list */}
      {vendors.length === 0 && !showAddForm ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No backup vendors yet.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Add one manually or decline the current vendor to trigger a search.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {vendors.map((vendor, i) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border rounded-lg p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {vendor.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {vendor.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <a
                          href={`tel:${vendor.phone}`}
                          className="text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          {vendor.phone}
                        </a>
                      </span>
                    )}
                    {vendor.address && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">
                          {vendor.address}
                        </span>
                      </span>
                    )}
                    {vendor.distanceKm > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {vendor.distanceKm.toFixed(1)} km
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
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
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-2 pt-1">
                {/* Contact status update */}
                {!vendor.promotedToStallId && (
                  <Select
                    value={vendor.contactStatus}
                    onValueChange={(v) =>
                      contactMutation.mutate({
                        vendorId: vendor.id,
                        contactStatus: v,
                      })
                    }
                  >
                    <SelectTrigger className="h-7 w-[130px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Promote button */}
                {!vendor.promotedToStallId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPromoteVendor(vendor)}
                    className="gap-1 text-xs text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    <ArrowUpCircle className="h-3 w-3" />
                    Promote
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Promote confirmation dialog */}
      <AlertDialog
        open={!!promoteVendor}
        onOpenChange={() => setPromoteVendor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote Backup Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to promote{' '}
              <span className="font-semibold">{promoteVendor?.name}</span> to
              an active stall? This will create a new confirmed stall for this
              vendor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={promoteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                promoteVendor && promoteMutation.mutate(promoteVendor.id)
              }
              disabled={promoteMutation.isPending}
              className="bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-600"
            >
              {promoteMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Promoting...
                </span>
              ) : (
                'Promote Vendor'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
