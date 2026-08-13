'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ArrowLeft, List, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import VirtualLobbyMap, { type LobbyData } from '@/components/lobby/virtual-lobby-map'
import POIDetailSheet from '@/components/lobby/poi-detail-sheet'
import type { POIData } from '@/components/lobby/poi-marker'
import { toast } from 'sonner'

type DirectionResult = {
  distance: number
  distanceMeters: number
  angle: number
  direction: string
  nearestSection: { id: string; name: string; distance: number } | null
}

export default function GuestLobbyPage() {
  const params = useParams<{ eventId: string }>()
  const eventId = params.eventId
  const { data: session } = useSession()

  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedPoi, setSelectedPoi] = useState<POIData | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [directionInfo, setDirectionInfo] = useState<DirectionResult | null>(null)

  const [mySeat, setMySeat] = useState<{ positionX: number; positionY: number; label: string } | undefined>(undefined)

  useEffect(() => {
    async function fetchLobby() {
      try {
        const res = await fetch(`/api/events/${eventId}/lobby`)
        if (!res.ok) {
          const body = await res.json()
          throw new Error(body.error || 'Failed to load lobby')
        }
        const json = await res.json()
        setLobbyData(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchLobby()
  }, [eventId])

  useEffect(() => {
    if (!session?.user?.id || !lobbyData) return
    async function fetchMySeat() {
      try {
        const res = await fetch(`/api/events/${eventId}/registrations?userId=${session.user.id}`)
        if (!res.ok) return
        const json = await res.json()
        const reg = json.data?.registrations?.[0]
        if (reg?.seatId) {
          const seatRes = await fetch(`/api/venues/seats/${reg.seatId}`)
          if (seatRes.ok) {
            const seatJson = await seatRes.json()
            const seat = seatJson.data
            if (seat) {
              setMySeat({
                positionX: seat.positionX,
                positionY: seat.positionY,
                label: seat.label,
              })
            }
          }
        }
      } catch {
        /* seat lookup is optional */
      }
    }
    fetchMySeat()
  }, [session?.user?.id, eventId, lobbyData])

  const handlePoiClick = useCallback(async (poi: POIData) => {
    setSelectedPoi(poi)
    setDirectionInfo(null)

    const fromX = mySeat?.positionX ?? 50
    const fromY = mySeat?.positionY ?? 50
    const toX = poi.positionX
    const toY = poi.positionY

    try {
      const res = await fetch(
        `/api/events/${eventId}/lobby/direction?fromX=${fromX}&fromY=${fromY}&toX=${toX}&toY=${toY}`
      )
      if (res.ok) {
        const json = await res.json()
        setDirectionInfo(json.data)
      }
    } catch {
      /* direction is optional */
    }

    setSheetOpen(true)
  }, [eventId, mySeat])

  const poiTypeColor: Record<string, string> = {
    food_stall: 'bg-orange-100 text-orange-800',
    restroom: 'bg-blue-100 text-blue-800',
    entrance: 'bg-amber-100 text-amber-800',
    stage: 'bg-purple-100 text-purple-800',
    seating_section: 'bg-sky-100 text-sky-800',
    other: 'bg-gray-100 text-gray-800',
  }

  const poiTypeLabel: Record<string, string> = {
    food_stall: 'Food',
    restroom: 'Restroom',
    entrance: 'Entrance',
    stage: 'Stage',
    seating_section: 'Seating',
    other: 'Other',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-4">
          <Skeleton className="h-[calc(100vh-120px)] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !lobbyData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6 text-center">
        <MapPin className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Lobby Unavailable</h2>
        <p className="text-muted-foreground max-w-sm">{error || 'This event lobby is not available.'}</p>
        <Button variant="outline" asChild>
          <Link href={`/events/${eventId}`}>Back to Event</Link>
        </Button>
      </div>
    )
  }

  const directionFrom = mySeat
    ? { x: mySeat.positionX, y: mySeat.positionY }
    : undefined

  const directionTo = selectedPoi
    ? { x: selectedPoi.positionX, y: selectedPoi.positionY }
    : undefined

  const distanceDisplay = directionInfo
    ? {
        distance: directionInfo.distanceMeters,
        direction: directionInfo.direction,
        sectionName: directionInfo.nearestSection?.name,
      }
    : undefined

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href={`/events/${eventId}`}>
                <ArrowLeft className="w-5 h-5" />
                <span className="sr-only">Back to Event</span>
              </Link>
            </Button>
            <h1 className="text-sm font-semibold truncate">{lobbyData.event.title}</h1>
          </div>

          {/* POI List Toggle (Drawer) */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Places</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Places on the Map</DrawerTitle>
              </DrawerHeader>
              <ScrollArea className="max-h-[50vh] px-4 pb-6">
                <div className="space-y-2">
                  {lobbyData.pois.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No places added yet.</p>
                  )}
                  {lobbyData.pois.map((poi) => (
                    <motion.button
                      key={poi.id}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left hover:bg-muted/50 transition-colors ${
                        selectedPoi?.id === poi.id ? 'border-orange-500 bg-orange-50' : 'border-border'
                      }`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handlePoiClick(poi)
                        document.querySelector('[data-radix-drawer-close]')?.dispatchEvent(new Event('click', { bubbles: true }))
                      }}
                    >
                      <Badge className={poiTypeColor[poi.type] || poiTypeColor.other} variant="secondary">
                        {poiTypeLabel[poi.type] || 'Other'}
                      </Badge>
                      <span className="text-sm font-medium truncate">{poi.name}</span>
                    </motion.button>
                  ))}
                </div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </div>

        {/* Seat stats bar */}
        <div className="flex items-center gap-3 px-4 pb-2 text-xs text-muted-foreground">
          <span>{lobbyData.venue.name}</span>
          <span className="text-border">|</span>
          <span>{lobbyData.seatStats.unoccupied} seats available</span>
          <span className="text-border">|</span>
          <span>{lobbyData.pois.length} places</span>
          {mySeat && (
            <>
              <span className="text-border">|</span>
              <span className="text-orange-600 font-medium">Seat {mySeat.label}</span>
            </>
          )}
        </div>
      </header>

      {/* Map takes remaining viewport */}
      <main className="flex-1 p-2 sm:p-4">
        <VirtualLobbyMap
          venueData={lobbyData}
          mySeat={mySeat}
          selectedPoiId={selectedPoi?.id ?? null}
          onPoiClick={handlePoiClick}
          directionFrom={directionFrom}
          directionTo={directionTo}
          distanceInfo={distanceDisplay}
        />
      </main>

      {/* POI Detail Sheet */}
      {selectedPoi && (
        <POIDetailSheet
          poi={selectedPoi}
          isOpen={sheetOpen}
          onClose={() => {
            setSheetOpen(false)
            setSelectedPoi(null)
            setDirectionInfo(null)
          }}
          distance={directionInfo?.distanceMeters}
          direction={directionInfo?.direction}
          sectionName={directionInfo?.nearestSection?.name}
        />
      )}
    </div>
  )
}
