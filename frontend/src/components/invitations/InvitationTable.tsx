'use client'

import { useState } from 'react'
import { Send, ShieldBan, Loader2, Inbox } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

type Invitation = {
  id: string
  guestName?: string
  guestEmail?: string
  tier: string
  status: string
  sentAt?: string
  checkedInAt?: string
  seatLabel?: string
}

type InvitationTableProps = {
  invitations: Invitation[]
  onResend: (id: string) => void
  onRevoke: (id: string) => void
  loading?: boolean
}

const STATUS_STYLES: Record<string, string> = {
  issued: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  opened: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  checked_in: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  revoked: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const PAGE_SIZE = 10

export default function InvitationTable({
  invitations: rawInvitations,
  onResend,
  onRevoke,
  loading = false,
}: InvitationTableProps) {
  const [page, setPage] = useState(0)
  const [revokeId, setRevokeId] = useState<string | null>(null)

  const invitations = Array.isArray(rawInvitations)
    ? rawInvitations
    : Array.isArray((rawInvitations as any)?.invitations)
    ? (rawInvitations as any).invitations
    : Array.isArray((rawInvitations as any)?.data?.invitations)
    ? (rawInvitations as any).data.invitations
    : Array.isArray((rawInvitations as any)?.data)
    ? (rawInvitations as any).data
    : []

  const totalPages = Math.max(1, Math.ceil(invitations.length / PAGE_SIZE))
  const paged = invitations.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  )

  function handleResend(id: string) {
    onResend(id)
  }

  function handleRevoke() {
    if (revokeId) {
      onRevoke(revokeId)
      setRevokeId(null)
    }
  }

  function formatTimestamp(ts?: string) {
    if (!ts) return '—'
    try {
      return new Date(ts).toLocaleString()
    } catch {
      return '—'
    }
  }

  if (!loading && invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-muted-foreground">
          No invitations yet
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Generate invitations or import a guest list to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px]">Guest Name</TableHead>
              <TableHead className="min-w-[200px] hidden sm:table-cell">
                Email
              </TableHead>
              <TableHead className="min-w-[80px]">Tier</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[140px] hidden md:table-cell">
                Sent At
              </TableHead>
              <TableHead className="min-w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Loading invitations...
                </TableCell>
              </TableRow>
            ) : (
              paged.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    {inv.guestName || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    {inv.guestEmail || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-xs">
                      {inv.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs capitalize',
                        STATUS_STYLES[inv.status] || STATUS_STYLES.issued
                      )}
                    >
                      {inv.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs hidden md:table-cell">
                    {formatTimestamp(inv.sentAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {inv.status !== 'revoked' && inv.status !== 'checked_in' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-orange-700 hover:text-orange-800 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/40"
                          onClick={() => handleResend(inv.id)}
                        >
                          <Send className="h-3 w-3" />
                          <span className="hidden sm:inline">Resend</span>
                        </Button>
                      )}
                      {inv.status !== 'revoked' && inv.status !== 'checked_in' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-red-700 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                          onClick={() => setRevokeId(inv.id)}
                        >
                          <ShieldBan className="h-3 w-3" />
                          <span className="hidden sm:inline">Revoke</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground text-xs">
            Showing {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, invitations.length)} of{' '}
            {invitations.length}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Revoke confirmation dialog */}
      <AlertDialog open={!!revokeId} onOpenChange={(open) => !open && setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this invitation? The guest will no
              longer be able to check in. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
