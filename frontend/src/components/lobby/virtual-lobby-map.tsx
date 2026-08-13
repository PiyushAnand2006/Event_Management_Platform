'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import POIMarker, { type POIData } from './poi-marker'
import DirectionArrow from './direction-arrow'
import DistanceLabel from './distance-label'
import MySeatIndicator from './my-seat-indicator'
import MapControls from './map-controls'

export type LobbySection = {
  id: string
  name: string
  positionX: number
  positionY: number
  width: number
  height: number
}

export type LobbyStall = {
  id: string
  stallType: string
  ownerName: string
  contractStatus: string
  cuisineType: string | null
  locationX: number | null
  locationY: number | null
}

export type LobbyData = {
  event: { id: string; title: string; status: string; date: string }
  venue: { id: string; name: string; width: number; height: number }
  sections: LobbySection[]
  pois: POIData[]
  stalls: LobbyStall[]
  seatStats: { total: number; occupied: number; unoccupied: number }
}

const ZOOM_MIN = 0.4
const ZOOM_MAX = 3
const ZOOM_STEP = 0.15

type VirtualLobbyMapProps = {
  venueData: LobbyData
  mySeat?: { positionX: number; positionY: number; label: string }
  selectedPoiId: string | null
  onPoiClick: (poi: POIData) => void
  directionFrom?: { x: number; y: number }
  directionTo?: { x: number; y: number }
  distanceInfo?: { distance: number; direction: string; sectionName?: string }
}

export default function VirtualLobbyMap({
  venueData,
  mySeat,
  selectedPoiId,
  onPoiClick,
  directionFrom,
  directionTo,
  distanceInfo,
}: VirtualLobbyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

  const { venue, sections, pois } = venueData

  // Compute pixel scale: fit venue into container
  const pixelScale = containerSize.w > 0
    ? Math.min((containerSize.w - 32) / venue.width, (containerSize.h - 32) / venue.height)
    : 4

  // Observe container size
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    setScale((prev) => {
      const next = prev - e.deltaY * 0.001
      return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
    })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Pinch zoom on mobile
  const lastTouchDist = useRef<number | null>(null)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const delta = dist - lastTouchDist.current
      setScale((prev) => {
        const next = prev + delta * 0.005
        return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
      })
      lastTouchDist.current = dist
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null
  }, [])

  // Pan (mouse drag)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y })
  }, [translate])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const zoomIn = useCallback(() => setScale((s) => Math.min(ZOOM_MAX, s + ZOOM_STEP)), [])
  const zoomOut = useCallback(() => setScale((s) => Math.max(ZOOM_MIN, s - ZOOM_STEP)), [])
  const resetView = useCallback(() => { setScale(1); setTranslate({ x: 0, y: 0 }) }, [])

  const effectiveScale = pixelScale * scale

  // Find the selected POI for the distance label positioning
  const selectedPoi = pois.find((p) => p.id === selectedPoiId)

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-xl border border-border bg-muted/30 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: `${effectiveScale * 5}px ${effectiveScale * 5}px`,
        }}
      />

      {/* Transform container */}
      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate(${16 + translate.x}px, ${16 + translate.y}px) scale(${scale})`,
        }}
      >
        {/* Sections */}
        {sections.map((section) => (
          <div
            key={section.id}
            className="absolute border-2 border-dashed border-orange-400/50 bg-orange-50/20 rounded flex items-center justify-center"
            style={{
              left: section.positionX * pixelScale,
              top: section.positionY * pixelScale,
              width: section.width * pixelScale,
              height: section.height * pixelScale,
            }}
          >
            <span className="text-[10px] font-medium text-orange-700/70 truncate px-1">
              {section.name}
            </span>
          </div>
        ))}

        {/* POI Markers */}
        {pois.map((poi) => (
          <div
            key={poi.id}
            className="absolute"
            style={{
              left: poi.positionX * pixelScale,
              top: poi.positionY * pixelScale,
            }}
          >
            <POIMarker
              poi={poi}
              isSelected={poi.id === selectedPoiId}
              onClick={onPoiClick}
            />
          </div>
        ))}

        {/* Direction arrow */}
        {directionFrom && directionTo && (
          <DirectionArrow
            fromX={directionFrom.x * pixelScale}
            fromY={directionFrom.y * pixelScale}
            toX={directionTo.x * pixelScale}
            toY={directionTo.y * pixelScale}
            scale={1}
          />
        )}

        {/* Distance label near destination */}
        {distanceInfo && selectedPoi && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              left: selectedPoi.positionX * pixelScale,
              top: selectedPoi.positionY * pixelScale - 28,
              transform: 'translateX(-50%)',
            }}
          >
            <DistanceLabel
              distance={distanceInfo.distance}
              direction={distanceInfo.direction}
              sectionName={distanceInfo.sectionName}
            />
          </div>
        )}

        {/* My Seat indicator */}
        {mySeat && (
          <div
            className="absolute"
            style={{
              left: mySeat.positionX * pixelScale,
              top: mySeat.positionY * pixelScale,
            }}
          >
            <MySeatIndicator
              positionX={0}
              positionY={0}
              label={mySeat.label}
            />
          </div>
        )}
      </div>

      {/* Declined stall banners */}
      {venueData.stalls.filter((s) => s.contractStatus === 'declined').length > 0 && (
        <div className="absolute top-3 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-none">
          {venueData.stalls
            .filter((s) => s.contractStatus === 'declined')
            .map((s) => (
              <div
                key={s.id}
                className="bg-amber-50 border border-amber-300 text-amber-800 text-xs px-3 py-2 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <span>⚠️</span>
                <span>
                  <span className="font-semibold">{s.cuisineType || s.stallType}</span> stall is unavailable. A replacement may be arranged.
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Map controls */}
      <MapControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetView} scale={scale} />
    </div>
  )
}
