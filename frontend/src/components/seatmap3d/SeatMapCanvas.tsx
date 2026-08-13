'use client'

import React, { Suspense, useRef, useEffect, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Loader2 } from 'lucide-react'
import VenueFloor from './VenueFloor'
import SectionLabel from './SectionLabel'
import SeatMesh from './SeatMesh'
import type { VenueSection, Seat, POI, Registration } from '@/types/venue'

/* ─── POI icon → color mapping ─── */
const POI_COLOR_MAP: Record<string, string> = {
  DoorOpen: '#10b981',
  Presentation: '#8b5cf6',
  Bath: '#3b82f6',
  UtensilsCrossed: '#f59e0b',
  Armchair: '#ec4899',
  MapPin: '#6b7280',
}

/* ─── Camera FlyTo Controller ─── */
function CameraFlyTo({
  seats,
  flyToSeatId,
  venueWidth,
  venueHeight,
}: {
  seats: Seat[]
  flyToSeatId: string | null
  venueWidth: number
  venueHeight: number
}) {
  const { camera } = useThree()
  const targetRef = useRef<THREE.Vector3 | null>(null)

  useEffect(() => {
    if (!flyToSeatId) {
      targetRef.current = null
      return
    }
    const seat = seats.find((s) => s.id === flyToSeatId)
    if (seat) {
      targetRef.current = new THREE.Vector3(seat.positionX, seat.positionZ, seat.positionY)
    }
  }, [flyToSeatId, seats])

  useFrame(() => {
    if (!targetRef.current) return

    // Move camera position to look at the seat from above-front
    const target = targetRef.current
    const camTarget = new THREE.Vector3(target.x, target.y + 15, target.z + 12)

    camera.position.lerp(camTarget, 0.04)

    // Also update OrbitControls target to point at the seat
    const lookAt = target.clone()
    const controls = (camera as unknown as { userData?: { controls?: { target: THREE.Vector3 } } }).userData?.controls
    // We use a group trick: store target in a ref that OrbitControls reads
  })

  return null
}

/* ─── OrbitControls Target Helper ─── */
function ControlsTarget({
  flyToSeatId,
  seats,
}: {
  flyToSeatId: string | null
  seats: Seat[]
}) {
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    if (!controlsRef.current) return
    if (!flyToSeatId) return
    const seat = seats.find((s) => s.id === flyToSeatId)
    if (!seat) return

    const target = new THREE.Vector3(seat.positionX, 0, seat.positionY)
    controlsRef.current.target.lerp(target, 1)
    controlsRef.current.update()
  }, [flyToSeatId, seats])

  return <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.08} />
}

/* ─── POI Marker ─── */
function POIMarker({ poi }: { poi: POI }) {
  const color = POI_COLOR_MAP[poi.icon] || '#6b7280'
  return (
    <group position={[poi.positionX, 0.4, poi.positionY]}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.4, 0.8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

/* ─── Loading Spinner ─── */
function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-950">
      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
    </div>
  )
}

/* ─── Scene Content (inside Canvas) ─── */
function SceneContent({
  venue,
  sections,
  seats,
  pois,
  selectedSeatId,
  onSeatClick,
  flyToSeatId,
  showUnoccupiedOnly,
  tierFilters,
}: {
  venue: { id: string; name: string; width: number; height: number }
  sections: VenueSection[]
  seats: Seat[]
  pois: POI[]
  registrations: Registration[]
  selectedSeatId: string | null
  onSeatClick: (seatId: string) => void
  onSeatStatusChange: (seatId: string, status: string) => void
  showUnoccupiedOnly: boolean
  tierFilters: Record<string, boolean>
  flyToSeatId: string | null
}) {
  // Compute seat visibility based on filters
  const visibleSeatIds = useMemo(() => {
    const set = new Set<string>()
    for (const seat of seats) {
      if (showUnoccupiedOnly && seat.status !== 'unoccupied') continue
      if (tierFilters[seat.tier] === false) continue
      set.add(seat.id)
    }
    return set
  }, [seats, showUnoccupiedOnly, tierFilters])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[venue.width / 2, 30, venue.height / 2]}
        intensity={0.8}
        castShadow
      />

      {/* Controls */}
      <ControlsTarget flyToSeatId={flyToSeatId} seats={seats} />

      {/* Camera fly-to animation */}
      <CameraFlyTo
        seats={seats}
        flyToSeatId={flyToSeatId}
        venueWidth={venue.width}
        venueHeight={venue.height}
      />

      {/* Floor */}
      <VenueFloor width={venue.width} height={venue.height} sections={sections} />

      {/* Section labels */}
      {sections.map((section) => (
        <SectionLabel key={section.id} section={section} />
      ))}

      {/* Seats */}
      {seats.map((seat) => (
        <SeatMesh
          key={seat.id}
          seat={seat}
          onClick={onSeatClick}
          isSelected={selectedSeatId === seat.id}
          isVisible={visibleSeatIds.has(seat.id)}
        />
      ))}

      {/* POI markers */}
      {pois.map((poi) => (
        <POIMarker key={poi.id} poi={poi} />
      ))}
    </>
  )
}

/* ─── Main Canvas Component ─── */
type SeatMapCanvasProps = {
  venue: { id: string; name: string; width: number; height: number }
  sections: VenueSection[]
  seats: Seat[]
  pois: POI[]
  registrations: Registration[]
  selectedSeatId: string | null
  onSeatClick: (seatId: string) => void
  onSeatStatusChange: (seatId: string, status: string) => void
  showUnoccupiedOnly: boolean
  tierFilters: Record<string, boolean>
  flyToSeatId: string | null
}

export default function SeatMapCanvas({
  venue,
  sections,
  seats,
  pois,
  registrations,
  selectedSeatId,
  onSeatClick,
  onSeatStatusChange,
  showUnoccupiedOnly,
  tierFilters,
  flyToSeatId,
}: SeatMapCanvasProps) {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{
          position: [venue.width / 2, 30, venue.height + 20],
          fov: 60,
          near: 0.1,
          far: 500,
        }}
        style={{ background: '#fafafa' }}
      >
        <Suspense fallback={null}>
          <SceneContent
            venue={venue}
            sections={sections}
            seats={seats}
            pois={pois}
            registrations={registrations}
            selectedSeatId={selectedSeatId}
            onSeatClick={onSeatClick}
            onSeatStatusChange={onSeatStatusChange}
            flyToSeatId={flyToSeatId}
            showUnoccupiedOnly={showUnoccupiedOnly}
            tierFilters={tierFilters}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}