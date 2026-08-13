"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  MoreHorizontal,
  Shield,
  ShieldCheck,
  User as UserIcon,
  Ban,
  Unlock,
  Trash2,
  Loader2,
} from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  isBlocked: boolean
  createdAt: string
}

interface AdminUserTableProps {
  users: UserRow[]
  onRoleChange: (id: string, role: string) => void
  onBlock: (id: string) => void
  onUnblock: (id: string) => void
  onDelete: (id: string) => void
  loading?: boolean
}

const roleConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string; icon: React.ReactNode }> = {
  admin: {
    variant: "destructive",
    className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    icon: <ShieldCheck className="h-3 w-3" />,
  },
  organizer: {
    variant: "default",
    className: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    icon: <Shield className="h-3 w-3" />,
  },
  customer: {
    variant: "secondary",
    className: "",
    icon: <UserIcon className="h-3 w-3" />,
  },
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-9 w-9 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function AdminUserTable({
  users,
  onRoleChange,
  onBlock,
  onUnblock,
  onDelete,
  loading,
}: AdminUserTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAction = (id: string, action: () => void) => {
    setActionLoading(id)
    action()
    setTimeout(() => setActionLoading(null), 1000)
  }

  if (!loading && users.length === 0) {
    return (
      <Card className="border-dashed">
        <div className="py-12 text-center">
          <UserIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            No users found
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Try adjusting your search or filter
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows />
          ) : (
            users.map((user) => {
              const role = roleConfig[user.role] || roleConfig.customer

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 text-xs font-semibold">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <span className="font-medium truncate max-w-[140px]">
                        {user.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[180px]">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.variant} className={role.className}>
                      {role.icon}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          user.isBlocked
                            ? "bg-red-500"
                            : "bg-orange-500"
                        }`}
                      />
                      <span className="text-sm">
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    {actionLoading === user.id ? (
                      <Loader2 className="inline h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Shield className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {(["customer", "organizer", "admin"] as const).map(
                                (r) => (
                                  <DropdownMenuItem
                                    key={r}
                                    disabled={user.role === r}
                                    onClick={() => handleAction(user.id, () => onRoleChange(user.id, r))}
                                  >
                                    <span className="capitalize">{r}</span>
                                    {user.role === r && (
                                      <span className="ml-auto text-xs text-muted-foreground">Current</span>
                                    )}
                                  </DropdownMenuItem>
                                )
                              )}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          {user.isBlocked ? (
                            <DropdownMenuItem
                              onClick={() => handleAction(user.id, () => onUnblock(user.id))}
                              className="text-orange-700 focus:text-orange-700 dark:text-orange-400"
                            >
                              <Unlock className="mr-2 h-4 w-4" />
                              Unblock
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleAction(user.id, () => onBlock(user.id))}
                              className="text-amber-700 focus:text-amber-700 dark:text-amber-400"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Block
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleAction(user.id, () => onDelete(user.id))}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
