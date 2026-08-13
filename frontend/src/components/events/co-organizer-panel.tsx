"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, X, Users, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type CoOrganizer = {
  id: string
  userId: string
  user: {
    name: string
    email: string
    image?: string | null
  }
}

interface CoOrganizerPanelProps {
  eventId: string
  coOrganizers: CoOrganizer[]
  loading?: boolean
}

export function CoOrganizerPanel({
  eventId,
  coOrganizers,
  loading,
}: CoOrganizerPanelProps) {
  const [email, setEmail] = useState("")
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (!email.trim()) return
    setAdding(true)
    try {
      const res = await fetch(`/api/events/${eventId}/co-organizers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) {
        setEmail("")
      }
    } catch {
      // Silently handle
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (coOrgId: string) => {
    try {
      await fetch(`/api/events/${eventId}/co-organizers/${coOrgId}`, {
        method: "DELETE",
      })
    } catch {
      // Silently handle
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          Co-Organizers
          {!loading && coOrganizers.length > 0 && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {coOrganizers.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add co-organizer */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter email to invite..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!email.trim() || adding}
            className="bg-orange-600 hover:bg-orange-700 text-white shrink-0"
          >
            {adding ? "..." : <UserPlus className="h-4 w-4" />}
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-2.5 w-32 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : coOrganizers.length === 0 ? (
          <div className="py-4 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-1.5 text-xs text-muted-foreground">
              No co-organizers yet
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {coOrganizers.map((co) => (
              <motion.div
                key={co.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 text-xs">
                    {co.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{co.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {co.user.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(co.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
}
