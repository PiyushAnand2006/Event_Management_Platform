'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Users,
  List,
  Map,
  Box,
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  MapPin,
  RefreshCw,
  UsersRound,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import FloorPlanEditor from '@/components/seatmap/floor-plan-editor'
import SectionToolbar from '@/components/seatmap/section-toolbar'
import SeatLegend from '@/components/seatmap/seat-legend'
import SeatAssignmentPanel from '@/components/seatmap/seat-assignment-panel'
import SeatFallbackList from '@/components/seatmap/seat-fallback-list'
import VenueCreateForm from '@/components/seatmap/venue-create-form'
import AutoAssignButton from '@/components/seatmap/auto-assign-button'
import AssignmentStatus, { type AssignmentStatusRef } from '@/components/seatmap/assignment-status'
import GroupAssignmentView from '@/components/seatmap/group-assignment-view'
import type { Venue, VenueSection, Seat, POI, Registration } from '@/types/venue'
import { POI_TYPES } from '@/types/venue'
import { hasWebGLSupport } from '@/components/seatmap3d/WebGLDetector'

// Dynamic import 3D canvas — cannot SSR
const SeatMapCanvas = dynamic(
  () => import('@/components/seatmap3d/SeatMapCanvas').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div> }
)
const SearchGuestFlyTo = dynamic(
  () => import('@/components/seatmap3d/SearchGuestFlyTo').then((mod) => mod.default),
  { ssr: false }
)
const SeatFilterControls = dynamic(
  () => import('@/components/seatmap3d/SeatFilterControls').then((mod) => mod.default),
  { ssr: false }
)
const SeatStatusOverlay = dynamic(
  () => import('@/components/seatmap3d/SeatStatusOverlay').then((mod) => mod.default),
  { ssr: false }
)

const ZOOM_MIN = 0.5
const ZOOM_MAX = 2
const ZOOM_STEP = 0.1

export default function SeatmapPage() {
  const params = useParams<{ eventId: string }>()
  const eventId = params.eventId
  const router = useRouter()

  // ─── State ───
  const [eventTitle, setEventTitle] = useState('')
  const [venue, setVenue] = useState<Venue | null>(null)
  const [sections, setSections] = useState<VenueSection[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [pois, setPois] = useState<POI[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [showAssignment, setShowAssignment] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'sections' | 'pois'>('sections')
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')
  const [showUnoccupiedOnly, setShowUnoccupiedOnly] = useState(false)
  const [tierFilters, setTierFilters] = useState<Record<string, boolean>>({ vip: true, reserved: true, general: true })
  const [flyToSeatId, setFlyToSeatId] = useState<string | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showGroups, setShowGroups] = useState(false)
  const assignmentStatusRef = useRef<AssignmentStatusRef>(null)

  // POI add form
  const [poiName, setPoiName] = useState('')
  const [poiType, setPoiType] = useState('entrance')
  const [showPoiForm, setShowPoiForm] = useState(false)
  const [deletePoiId, setDeletePoiId] = useState<string | null>(null)

  // ─── Fetch all data ───
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [eventRes, venueRes, regRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/venue`),
        fetch(`/api/events/${eventId}/registrations?limit=100`),
      ])
      const [eventJson, venueJson, regJson] = await Promise.all([
        eventRes.json(),
        venueRes.json(),
        regRes.json(),
      ])
      if (eventJson.success) {
        setEventTitle(eventJson.data.title)
      }
      if (venueJson.success && venueJson.data) {
        const v = venueJson.data
        setVenue({ id: v.id, name: v.name, eventId: v.eventId, width: v.width, height: v.height, coordinates: v.coordinates })
        // Parse nested sections with seat counts
        const secs: VenueSection[] = (v.sections || []).map((s: Record<string, unknown>) => ({
          id: s.id,
          venueId: s.venueId,
          name: s.name,
          shape: s.shape,
          preset: s.preset,
          positionX: s.positionX,
          positionY: s.positionY,
          width: s.width,
          height: s.height,
          sortOrder: s.sortOrder,
          _count: { seats: (s.seats as unknown[])?.length || 0 },
        }))
        setSections(secs)
        // Parse all seats
        const allSeats: Seat[] = (v.seats || []).map((s: Record<string, unknown>) => ({
          id: s.id,
          venueId: s.venueId,
          sectionId: s.sectionId,
          label: s.label,
          positionX: s.positionX,
          positionY: s.positionY,
          positionZ: s.positionZ,
          rotation: s.rotation,
          tier: s.tier,
          status: s.status,
          assignedGuestId: s.assignedGuestId,
          groupId: s.groupId,
          assignedGuest: s.assignedGuest ? { id: s.assignedGuest.id, name: (s.assignedGuest as Record<string, unknown>).userId || '' } : undefined,
        }))
        setSeats(allSeats)
        // Parse POIs
        const p: POI[] = (v.pois || []).map((poi: Record<string, unknown>) => ({
          id: poi.id,
          venueId: poi.venueId,
          type: poi.type,
          name: poi.name,
          positionX: poi.positionX,
          positionY: poi.positionY,
          refId: poi.refId,
          icon: poi.icon,
          sortOrder: poi.sortOrder,
        }))
        setPois(p)
      } else {
        setVenue(null)
        setSections([])
        setSeats([])
        setPois([])
      }
      if (regJson.success) {
        const regs = regJson.data.registrations || regJson.data || []
        setRegistrations(
          (Array.isArray(regs) ? regs : []).map((r: Record<string, unknown>) => ({
            id: r.id,
            userId: r.userId,
            userName: r.user?.name || 'Unknown',
            status: r.status,
            seatId: r.seatId,
          }))
        )
      }
    } catch {
      toast({ title: 'Error loading data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleVenueCreated() {
    fetchData()
  }

  // ─── Auto-assign callback ───
  function handleAutoAssigned() {
    fetchData()
    assignmentStatusRef.current?.refresh()
  }

  // ─── Section operations (use venueId) ───
  async function handleAddSection(data: { name: string; preset: string; shape: string }) {
    if (!venue) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/venues/${venue.id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) { toast({ title: 'Error', description: json.error, variant: 'destructive' }); return }
      toast({ title: 'Section added', description: `"${data.name}" has been created.` })
      await fetchData()
    } catch {
      toast({ title: 'Error', description: 'Failed to add section', variant: 'destructive' })
    } finally { setActionLoading(false) }
  }

  async function handleDeleteSection(sectionId: string) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/venues/sections/${sectionId}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) { toast({ title: 'Error', description: json.error, variant: 'destructive' }); return }
      toast({ title: 'Section deleted' })
      if (selectedSectionId === sectionId) setSelectedSectionId(null)
      await fetchData()
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    finally { setActionLoading(false) }
  }

  async function handleUpdateSection(sectionId: string, data: Partial<VenueSection>) {
    try {
      const res = await fetch(`/api/venues/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) { toast({ title: 'Error', description: json.error, variant: 'destructive' }); return }
      toast({ title: 'Section updated' })
      await fetchData()
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
  }

  async function handleGenerateSeats(sectionId: string) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/venues/sections/${sectionId}/seats/generate`, { method: 'POST' })
      const json = await res.json()
      if (!json.success) { toast({ title: 'Error', description: json.error, variant: 'destructive' }); return }
      toast({ title: 'Seats generated' })
      await fetchData()
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    finally { setActionLoading(false) }
  }

  async function handleSectionMove(sectionId: string, x: number, y: number) {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, positionX: x, positionY: y } : s)))
    try {
      await fetch(`/api/venues/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionX: x, positionY: y }),
      })
    } catch { /* silent optimistic update */ }
  }

  // ─── POI operations (use venueId) ───
  async function handleAddPoi() {
    if (!poiName.trim() || !venue) return
    const poiTypeInfo = POI_TYPES.find((p) => p.value === poiType)
    setActionLoading(true)
    try {
      const res = await fetch(`/api/venues/${venue.id}/pois`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: poiName.trim(),
          type: poiType,
          icon: poiTypeInfo?.icon || 'MapPin',
          positionX: venue.width / 2,
          positionY: venue.height / 2,
        }),
      })
      const json = await res.json()
      if (!json.success) { toast({ title: 'Error', description: json.error, variant: 'destructive' }); return }
      toast({ title: 'POI added', description: `"${poiName.trim()}" placed at center.` })
      setPoiName('')
      setShowPoiForm(false)
      await fetchData()
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    finally { setActionLoading(false) }
  }

  async function handleDeletePoi(poiId: string) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/venues/pois/${poiId}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) { toast({ title: 'Error', description: json.error, variant: 'destructive' }); return }
      toast({ title: 'POI removed' })
      await fetchData()
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    finally { setActionLoading(false); setDeletePoiId(null) }
  }

  async function handlePoiMove(poiId: string, x: number, y: number) {
    setPois((prev) => prev.map((p) => (p.id === poiId ? { ...p, positionX: x, positionY: y } : p)))
    try {
      await fetch(`/api/venues/pois/${poiId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionX: x, positionY: y }),
      })
    } catch { /* silent */ }
  }

  // ─── Seat status change ───
  async function handleSeatStatusChange(seatId: string, status: string) {
    try {
      const res = await fetch(`/api/venues/seats/${seatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!json.success) { toast({ title: 'Error', description: json.error, variant: 'destructive' }); return }
      setSeats((prev) => prev.map((s) => (s.id === seatId ? { ...s, status } : s)))
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
  }

  // ─── Assignment operations (use seatId directly) ───
  async function handleAssign(registrationId: string, seatId: string) {
    try {
      const res = await fetch(`/api/venues/seats/${seatId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      })
      const json = await res.json()
      if (!json.success) { toast({ title: 'Error', description: json.error, variant: 'destructive' }); return }
      await fetchData()
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
  }

  async function handleUnassign(seatId: string) {
    try {
      const res = await fetch(`/api/venues/seats/${seatId}/unassign`, { method: 'PATCH' })
      const json = await res.json()
      if (!json.success) { toast({ title: 'Error', description: json.error, variant: 'destructive' }); return }
      await fetchData()
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
  }

  // ─── Zoom ───
  function zoomIn() { setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(1))) }
  function zoomOut() { setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(1))) }

  // ─── Memoized data for panels ───
  const assignmentSeats = useMemo(
    () =>
      seats.map((s) => {
        const sec = sections.find((sec) => sec.id === s.sectionId)
        return {
          id: s.id,
          label: s.label,
          sectionName: sec?.name || '',
          tier: s.tier,
          status: s.status,
          assignedGuestId: s.assignedGuestId,
        }
      }),
    [seats, sections]
  )

  const fallbackSeats = useMemo(
    () =>
      seats.map((s) => {
        const sec = sections.find((sec) => sec.id === s.sectionId)
        return {
          id: s.id,
          label: s.label,
          sectionName: sec?.name || '',
          tier: s.tier,
          status: s.status,
          positionX: s.positionX,
          positionY: s.positionY,
          assignedGuestName: s.assignedGuest?.name,
        }
      }),
    [seats, sections]
  )

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    )
  }

  // ─── No venue → show create form ───
  if (!venue) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Seat Map Builder</h1>
        </div>
        <VenueCreateForm eventId={eventId} onSuccess={handleVenueCreated} />
      </div>
    )
  }

  // ─── POI sidebar content ───
  function POISidebar() {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">POI Markers</h3>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowPoiForm(!showPoiForm)}>
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-2">
            <AnimatePresence>
              {showPoiForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-lg border border-orange-200 dark:border-orange-800 p-3 space-y-2 bg-orange-50/50 dark:bg-orange-950/20">
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input className="h-8 text-sm" placeholder="e.g. Main Entrance" value={poiName} onChange={(e) => setPoiName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddPoi()} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select value={poiType} onValueChange={setPoiType}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {POI_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button size="sm" className="h-7 text-xs w-full" onClick={handleAddPoi} disabled={actionLoading}>
                      {actionLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}
                      Add POI
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {pois.length === 0 && !showPoiForm && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No POIs yet.<br /><span className="text-xs">Add markers for entrances, stages, etc.</span>
              </div>
            )}

            {pois.map((poi) => (
              <div key={poi.id} className="rounded-lg border p-3 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-sm font-medium truncate">{poi.name}</span>
                  </div>
                  <Button
                    variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeletePoiId(poi.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Badge variant="outline" className="text-[10px] h-5 mt-1 capitalize">{poi.type.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        </div>

        <AlertDialog open={!!deletePoiId} onOpenChange={(o) => !o && setDeletePoiId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete POI?</AlertDialogTitle>
              <AlertDialogDescription>This will remove this marker from the floor plan.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deletePoiId && handleDeletePoi(deletePoiId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // ─── Main layout ───
  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Map className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Seat Map Builder
            </h1>
            {eventTitle && <p className="text-sm text-muted-foreground mt-0.5">{eventTitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile sidebar toggle */}
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <Button variant="outline" size="sm" className="lg:hidden gap-1.5" onClick={() => setMobileSidebarOpen(true)}>
              <Grid3X3 className="h-4 w-4" />
              Panels
            </Button>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="px-4 py-3 border-b">
                <SheetTitle className="text-sm">Tools</SheetTitle>
              </SheetHeader>
              <div className="h-full flex flex-col">
                <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as 'sections' | 'pois')} className="flex-1 flex flex-col min-h-0">
                  <div className="px-4 pt-2">
                    <TabsList className="w-full">
                      <TabsTrigger value="sections" className="flex-1">Sections</TabsTrigger>
                      <TabsTrigger value="pois" className="flex-1">POIs</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="sections" className="flex-1 min-h-0 mt-0">
                    <SectionToolbar
                      sections={sections}
                      onSelectSection={(id) => { setSelectedSectionId(id); setMobileSidebarOpen(false) }}
                      selectedSectionId={selectedSectionId}
                      onAddSection={handleAddSection}
                      onDeleteSection={handleDeleteSection}
                      onUpdateSection={handleUpdateSection}
                      onGenerateSeats={handleGenerateSeats}
                      loading={actionLoading}
                    />
                  </TabsContent>
                  <TabsContent value="pois" className="flex-1 min-h-0 mt-0">
                    <POISidebar />
                  </TabsContent>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>

          {/* View mode toggle: 2D / 3D */}
          {hasWebGLSupport() && (
            <Button variant={viewMode === '3d' ? 'default' : 'outline'} size="sm" className="gap-1.5" onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}>
              {viewMode === '3d' ? <Map className="h-4 w-4" /> : <Box className="h-4 w-4" />}
              <span className="hidden sm:inline">{viewMode === '3d' ? '2D' : '3D'}</span>
            </Button>
          )}

          {/* View toggle (visual/table) — only in 2D mode */}
          {viewMode === '2d' && (
          <Button variant={showFallback ? 'default' : 'outline'} size="sm" className="gap-1.5" onClick={() => setShowFallback(!showFallback)}>
            {showFallback ? <Map className="h-4 w-4" /> : <List className="h-4 w-4" />}
            <span className="hidden sm:inline">{showFallback ? 'Visual' : 'Table'}</span>
          </Button>
          )}

          {/* Assignment panel toggle */}
          <Button variant={showAssignment ? 'default' : 'outline'} size="sm" className="gap-1.5" onClick={() => setShowAssignment(!showAssignment)}>
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Assign</span>
          </Button>

          {/* Auto-assign seats */}
          {venue && (
            <AutoAssignButton
              eventId={eventId}
              venueId={venue.id}
              onAssigned={handleAutoAssigned}
            />
          )}

          {/* Groups button */}
          {venue && (
            <Button
              variant={showGroups ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={() => setShowGroups(true)}
            >
              <UsersRound className="h-4 w-4" />
              <span className="hidden sm:inline">Groups</span>
            </Button>
          )}

          {/* Lobby Preview button */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-orange-700 border-orange-300 hover:bg-orange-50"
            onClick={() => router.push(`/events/${eventId}/lobby`)}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Lobby Preview</span>
          </Button>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={zoomOut} disabled={zoom <= ZOOM_MIN}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={zoomIn} disabled={zoom >= ZOOM_MAX}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant={showGrid ? 'default' : 'outline'}
            size="icon" className="h-8 w-8 hidden sm:flex"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" className="h-8 w-8 hidden sm:flex" onClick={() => { setZoom(1); fetchData() }} title="Reset view">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Assignment status bar */}
      {venue && (
        <div className="flex items-center gap-4 flex-wrap">
          <AssignmentStatus ref={assignmentStatusRef} eventId={eventId} />
        </div>
      )}

      {/* Main content area */}
      <div className="flex gap-0">
        {/* Desktop left sidebar */}
        <div className="hidden lg:block w-80 shrink-0 border-r rounded-l-lg overflow-hidden bg-background">
          <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as 'sections' | 'pois')} className="flex flex-col h-full">
            <div className="px-4 pt-3 shrink-0">
              <TabsList className="w-full">
                <TabsTrigger value="sections" className="flex-1">Sections</TabsTrigger>
                <TabsTrigger value="pois" className="flex-1">POIs</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="sections" className="flex-1 min-h-0 mt-0">
              <SectionToolbar
                sections={sections}
                onSelectSection={setSelectedSectionId}
                selectedSectionId={selectedSectionId}
                onAddSection={handleAddSection}
                onDeleteSection={handleDeleteSection}
                onUpdateSection={handleUpdateSection}
                onGenerateSeats={handleGenerateSeats}
                loading={actionLoading}
              />
            </TabsContent>
            <TabsContent value="pois" className="flex-1 min-h-0 mt-0">
              <POISidebar />
            </TabsContent>
          </Tabs>
        </div>

        {/* Center: Editor, 3D View, or Fallback list */}
        <div className="flex-1 min-w-0 relative">
          <AnimatePresence mode="wait">
            {viewMode === '3d' && !showFallback ? (
              <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-[calc(100vh-14rem)] min-h-[400px]">
                {/* 3D Filter controls */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                  <SearchGuestFlyTo
                    registrations={registrations.map((r) => ({ userId: r.userId, userName: r.userName, seatId: r.seatId, seat: seats.find((s) => s.id === r.seatId) }))}
                    onFlyTo={(seatId) => setFlyToSeatId(seatId)}
                  />
                  <SeatFilterControls
                    showUnoccupiedOnly={showUnoccupiedOnly}
                    onToggleUnoccupied={() => setShowUnoccupiedOnly(!showUnoccupiedOnly)}
                    tierFilters={tierFilters}
                    onToggleTier={(tier) => setTierFilters((prev) => ({ ...prev, [tier]: !prev[tier] }))}
                  />
                </div>
                {/* 3D Stats overlay */}
                <div className="absolute top-3 right-3 z-10">
                  <SeatStatusOverlay stats={{
                    total: seats.length,
                    unoccupied: seats.filter((s) => s.status === 'unoccupied').length,
                    occupied: seats.filter((s) => s.status === 'occupied').length,
                    blocked: seats.filter((s) => s.status === 'blocked').length,
                    byTier: {
                      vip: seats.filter((s) => s.tier === 'vip').length,
                      reserved: seats.filter((s) => s.tier === 'reserved').length,
                      general: seats.filter((s) => s.tier === 'general').length,
                    },
                  }} />
                </div>
                {/* 3D Canvas */}
                <SeatMapCanvas
                  venue={{ id: venue.id, name: venue.name, width: venue.width, height: venue.height }}
                  sections={sections}
                  seats={seats}
                  pois={pois}
                  registrations={registrations}
                  selectedSeatId={selectedSeatId}
                  onSeatClick={(id) => setSelectedSeatId(id === selectedSeatId ? null : id)}
                  onSeatStatusChange={handleSeatStatusChange}
                  showUnoccupiedOnly={showUnoccupiedOnly}
                  tierFilters={tierFilters}
                  flyToSeatId={flyToSeatId}
                />
              </motion.div>
            ) : showFallback ? (
              <motion.div key="fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                <SeatFallbackList
                  seats={fallbackSeats}
                  onSeatClick={(id) => setSelectedSeatId(id === selectedSeatId ? null : id)}
                  onStatusChange={handleSeatStatusChange}
                  selectedSeatId={selectedSeatId}
                />
              </motion.div>
            ) : (
              <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-[calc(100vh-14rem)] min-h-[400px]">
                <div className="absolute top-3 left-3 z-10">
                  <SeatLegend />
                </div>
                <FloorPlanEditor
                  venue={{ id: venue.id, width: venue.width, height: venue.height }}
                  sections={sections}
                  seats={seats}
                  pois={pois}
                  onSectionMove={handleSectionMove}
                  onSectionResize={() => {}}
                  onSeatClick={(id) => setSelectedSeatId(id === selectedSeatId ? null : id)}
                  onPoiMove={handlePoiMove}
                  selectedSeatId={selectedSeatId}
                  zoom={zoom}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Seat Assignment Panel (Sheet from right) */}
      <SeatAssignmentPanel
        registrations={registrations}
        seats={assignmentSeats}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
        selectedSeatId={selectedSeatId}
        open={showAssignment}
        onOpenChange={setShowAssignment}
      />

      {/* Group Assignment View (Sheet from right) */}
      {venue && (
        <GroupAssignmentView
          eventId={eventId}
          venueId={venue.id}
          open={showGroups}
          onOpenChange={setShowGroups}
        />
      )}
    </div>
  )
}
