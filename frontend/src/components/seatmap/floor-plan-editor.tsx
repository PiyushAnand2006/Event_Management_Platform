'use client'

import React, { useCallback, useRef } from 'react'
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  DoorOpen,
  Presentation,
  Bath,
  UtensilsCrossed,
  Armchair,
  MapPin,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SeatDotInner } from './seat-dot'
import type { VenueSection, Seat, POI } from '@/types/venue'

const POI_ICON_MAP: Record<string, LucideIcon> = {
  DoorOpen,
  Presentation,
  Bath,
  UtensilsCrossed,
  Armchair,
  MapPin,
}

const GRID_SIZE = 10

interface FloorPlanEditorProps {
  venue: { id: string; width: number; height: number }
  sections: VenueSection[]
  seats: Seat[]
  pois: POI[]
  onSectionMove: (sectionId: string, x: number, y: number) => void
  onSectionResize: (sectionId: string, width: number, height: number) => void
  onSeatClick: (seatId: string) => void
  onPoiMove: (poiId: string, x: number, y: number) => void
  selectedSeatId: string | null
  zoom: number
}

/* ─── Draggable Section Wrapper ─── */
function DraggableSection({
  section,
  sectionSeats,
  isSelected,
  onSelect,
  onSeatClick,
  selectedSeatId,
  zoom,
}: {
  section: VenueSection
  sectionSeats: Seat[]
  isSelected: boolean
  onSelect: (id: string) => void
  onSeatClick: (id: string) => void
  selectedSeatId: string | null
  zoom: number
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `section-${section.id}`,
    data: { type: 'section', sectionId: section.id },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    left: section.positionX,
    top: section.positionY,
    width: section.width,
    height: section.height,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(section.id)
      }}
      className={cn(
        'absolute rounded-md border-2 transition-shadow group',
        isDragging && 'z-50 opacity-80 shadow-2xl',
        isSelected
          ? 'border-orange-500 shadow-lg shadow-orange-500/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
        section.shape === 'circle' && 'rounded-full'
      )}
    >
      {/* Section background */}
      <div className={cn(
        'absolute inset-0 rounded-[inherit] bg-white/60 dark:bg-gray-900/60',
        isSelected && 'bg-orange-50/40 dark:bg-orange-950/20'
      )} />

      {/* Drag handle area (top bar) */}
      <div
        className="absolute top-0 left-0 right-0 h-6 flex items-center justify-between px-2 cursor-grab active:cursor-grabbing rounded-t-[inherit] bg-gray-100/80 dark:bg-gray-800/80"
        {...listeners}
      >
        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[60%]">
          {section.name}
        </span>
        <span className="text-[9px] text-muted-foreground">
          {sectionSeats.length} seats
        </span>
      </div>

      {/* Seat dots */}
      {sectionSeats.map((seat) => {
        const relX = (seat.positionX - section.positionX)
        const relY = (seat.positionY - section.positionY)
        return (
          <SeatDotInner
            key={seat.id}
            seat={{
              id: seat.id,
              label: seat.label,
              tier: seat.tier,
              status: seat.status,
              x: relX,
              y: relY,
              assignedGuestName: seat.assignedGuest?.name,
            }}
            isSelected={selectedSeatId === seat.id}
            onClick={onSeatClick}
            showTooltip={true}
          />
        )
      })}
    </div>
  )
}

/* ─── Draggable POI Marker ─── */
function DraggablePOI({
  poi,
  onMove,
}: {
  poi: POI
  onMove: (id: string, x: number, y: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `poi-${poi.id}`,
    data: { type: 'poi', poiId: poi.id },
  })

  const IconComponent = POI_ICON_MAP[poi.icon] || MapPin

  const style = {
    transform: CSS.Translate.toString(transform),
    left: poi.positionX,
    top: poi.positionY,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'absolute z-30 flex items-center justify-center cursor-grab active:cursor-grabbing',
        isDragging && 'z-50 opacity-80'
      )}
      title={poi.name}
    >
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white dark:bg-gray-800 border-2 border-orange-500 shadow-md">
        <IconComponent className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      </div>
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {poi.name}
      </span>
    </div>
  )
}

/* ─── Main FloorPlanEditor ─── */
export default function FloorPlanEditor({
  venue,
  sections,
  seats,
  pois,
  onSectionMove,
  onSeatClick,
  onPoiMove,
  selectedSeatId,
  zoom,
}: FloorPlanEditorProps) {
  const { setNodeRef: setFloorRef, isOver } = useDroppable({ id: 'floor-plan' })
  const containerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event
      const data = active.data.current
      if (!data) return

      if (data.type === 'section') {
        const section = sections.find((s) => s.id === data.sectionId)
        if (section) {
          const newX = Math.max(0, Math.min(venue.width - section.width, section.positionX + delta.x / zoom))
          const newY = Math.max(0, Math.min(venue.height - section.height, section.positionY + delta.y / zoom))
          onSectionMove(data.sectionId, newX, newY)
        }
      }

      if (data.type === 'poi') {
        const poi = pois.find((p) => p.id === data.poiId)
        if (poi) {
          const newX = Math.max(0, Math.min(venue.width, poi.positionX + delta.x / zoom))
          const newY = Math.max(0, Math.min(venue.height, poi.positionY + delta.y / zoom))
          onPoiMove(data.poiId, newX, newY)
        }
      }
    },
    [sections, pois, venue.width, venue.height, zoom, onSectionMove, onPoiMove]
  )

  const sectionMap = React.useMemo(() => {
    const map = new Map<string, Seat[]>()
    for (const seat of seats) {
      const list = map.get(seat.sectionId) || []
      list.push(seat)
      map.set(seat.sectionId, list)
    }
    return map
  }, [seats])

  return (
    <div className="relative w-full h-full overflow-auto bg-muted/30 rounded-lg border" ref={containerRef}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          ref={setFloorRef}
          className={cn(
            'relative origin-top-left border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950',
            isOver && 'ring-2 ring-orange-400 ring-offset-2'
          )}
          style={{
            width: venue.width,
            height: venue.height,
            transform: `scale(${zoom})`,
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            minHeight: venue.height,
            minWidth: venue.width,
          }}
          onClick={() => onSeatClick('')}
        >
          {/* Sections */}
          {sections.map((section) => (
            <DraggableSection
              key={section.id}
              section={section}
              sectionSeats={sectionMap.get(section.id) || []}
              isSelected={false}
              onSelect={() => {}}
              onSeatClick={onSeatClick}
              selectedSeatId={selectedSeatId}
              zoom={zoom}
            />
          ))}

          {/* POI Markers */}
          {pois.map((poi) => (
            <DraggablePOI key={poi.id} poi={poi} onMove={onPoiMove} />
          ))}

          {/* Empty state */}
          {sections.length === 0 && pois.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium opacity-60">Empty Floor Plan</p>
                <p className="text-xs opacity-40 mt-1">Add sections and POIs from the sidebar</p>
              </div>
            </div>
          )}
        </div>
      </DndContext>
    </div>
  )
}
