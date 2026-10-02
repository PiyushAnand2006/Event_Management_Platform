'use client'

import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
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
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AdminEventTable } from '@/components/admin/admin-event-table'
import { useToast } from '@/hooks/use-toast'

type PendingEvent = {
  id: string
  title: string
  category: string
  date: string
  // The API returns the organizer as a nested object rather than a flat name.
  organizer?: { id: string; name: string; email: string }
  status: string
  createdAt: string
}

export default function AdminPendingPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const pageSize = 10

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/pending-events?${params.toString()}`)
      if (!res.ok) throw new Error('Failed')
      const body = await res.json()
      // The endpoint wraps its payload in a { success, data } envelope, so the
      // rows live one level deeper than the top-level object.
      return body.data || body
    },
  })

  const events: PendingEvent[] = data?.events || []
  const total: number = data?.pagination?.total ?? events.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/pending-events/${id}/approve`, { method: 'POST' })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending'] })
      toast({ title: 'Event approved' })
    },
    onError: () => {
      toast({ title: 'Failed to approve', variant: 'destructive' })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await fetch(`/api/admin/pending-events/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending'] })
      setRejectTarget(null)
      setRejectReason('')
      toast({ title: 'Event rejected' })
    },
    onError: () => {
      toast({ title: 'Failed to reject', variant: 'destructive' })
    },
  })

  const handleApprove = useCallback(
    (id: string) => approveMutation.mutate(id),
    [approveMutation]
  )

  const handleReject = useCallback(
    (id: string, reason?: string) => {
      if (reason !== undefined) {
        // Direct reject (bulk)
        rejectMutation.mutate({ id, reason })
      } else {
        // Open dialog
        setRejectTarget(id)
      }
    },
    [rejectMutation]
  )

  const confirmReject = () => {
    if (rejectTarget) {
      rejectMutation.mutate({ id: rejectTarget, reason: rejectReason || undefined })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pending Events</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve or reject submitted events.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <AdminEventTable
        events={events}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={isLoading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <AlertDialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Event</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejecting this event. This will be sent to the organizer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-reason">Reason (optional)</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Incomplete information, policy violation..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={rejectMutation.isPending}
            >
              Reject Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
