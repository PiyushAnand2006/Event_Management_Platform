"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Clock, CalendarDays, User, Tag, Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

type PendingEvent = {
  id: string
  title: string
  category: string
  date: string
  organizerName: string
  status: string
  createdAt: string
}

interface AdminEventTableProps {
  events: PendingEvent[]
  onApprove: (id: string) => void
  onReject: (id: string, reason?: string) => void
  loading?: boolean
}

const statusBadge: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  pending: { variant: "outline", label: "Pending" },
  published: { variant: "default", label: "Published" },
  rejected: { variant: "destructive", label: "Rejected" },
}

function StatusBadge({ status }: { status: string }) {
  const config = statusBadge[status] || statusBadge.pending
  let className = ""
  if (status === "pending")
    className = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
  if (status === "published")
    className = "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
  if (status === "rejected")
    className = ""

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="flex gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function AdminEventTable({
  events,
  onApprove,
  onReject,
  loading,
}: AdminEventTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleAll = () => {
    if (selected.size === events.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(events.map((e) => e.id)))
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const handleBulkApprove = () => {
    selected.forEach((id) => onApprove(id))
    setSelected(new Set())
  }

  const handleBulkReject = () => {
    selected.forEach((id) => onReject(id))
    setSelected(new Set())
  }

  if (!loading && events.length === 0) {
    return (
      <Card className="border-dashed">
        <div className="py-12 text-center">
          <Clock className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            No pending events to review
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            All events have been processed
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/30"
          >
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              {selected.size} selected
            </span>
            <Button size="sm" variant="outline" onClick={handleBulkApprove} className="text-orange-700 border-orange-300 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-900/50">
              <Check className="mr-1 h-3.5 w-3.5" /> Approve All
            </Button>
            <Button size="sm" variant="outline" onClick={handleBulkReject} className="text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/50">
              <X className="mr-1 h-3.5 w-3.5" /> Reject All
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10">
                <Checkbox
                  checked={events.length > 0 && selected.size === events.length}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonRows />
            ) : (
              events.map((event) => (
                <TableRow
                  key={event.id}
                  className={selected.has(event.id) ? "bg-orange-50/50 dark:bg-orange-950/20" : ""}
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.has(event.id)}
                      onCheckedChange={() => toggleOne(event.id)}
                      aria-label={`Select ${event.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate max-w-[200px]">
                        {event.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[120px]">
                        {event.organizerName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      <Tag className="mr-1 h-3 w-3" />
                      {event.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(event.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={event.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(event.createdAt), "MMM d")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-700 border-orange-300 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-900/50"
                        onClick={() => onApprove(event.id)}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/50"
                        onClick={() => onReject(event.id)}
                      >
                        <X className="mr-1 h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
