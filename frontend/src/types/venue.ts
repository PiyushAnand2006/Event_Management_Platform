'use client'

export type VenueSection = {
  id: string
  venueId: string
  name: string
  shape: string
  preset: string | null
  positionX: number
  positionY: number
  width: number
  height: number
  sortOrder: number
  _count?: { seats: number }
}

export type Seat = {
  id: string
  venueId: string
  sectionId: string
  label: string
  positionX: number
  positionY: number
  positionZ: number
  rotation: number
  tier: string
  status: string
  assignedGuestId: string | null
  groupId: string | null
  assignedGuest?: { id: string; name: string }
  section?: VenueSection
}

export type POI = {
  id: string
  venueId: string
  type: string
  name: string
  positionX: number
  positionY: number
  refId: string | null
  icon: string
  sortOrder: number
}

export type Venue = {
  id: string
  name: string
  eventId: string
  width: number
  height: number
  coordinates: string | null
}

export type Registration = {
  id: string
  userId: string
  userName: string
  status: string
  seatId?: string
}

export type TierColor = {
  unoccupied: string
  occupied: string
}

export const TIER_COLORS: Record<string, TierColor> = {
  vip: { unoccupied: '#EAB308', occupied: '#A16207' },
  reserved: { unoccupied: '#14B8A6', occupied: '#0F766E' },
  general: { unoccupied: '#9CA3AF', occupied: '#4B5563' },
}

export const BLOCKED_COLOR = '#EF4444'

export const SECTION_PRESETS = [
  { value: 'theatre', label: 'Theatre' },
  { value: 'round_table', label: 'Round Tables' },
  { value: 'classroom', label: 'Classroom' },
  { value: 'banquet', label: 'Banquet' },
  { value: 'custom', label: 'Custom' },
] as const

export const POI_TYPES = [
  { value: 'entrance', label: 'Entrance', icon: 'DoorOpen' },
  { value: 'stage', label: 'Stage', icon: 'Presentation' },
  { value: 'restroom', label: 'Restroom', icon: 'Bath' },
  { value: 'food_stall', label: 'Food Stall', icon: 'UtensilsCrossed' },
  { value: 'seating_section', label: 'Seating Section', icon: 'Armchair' },
  { value: 'other', label: 'Other', icon: 'MapPin' },
] as const

export function getSeatColor(tier: string, status: string): string {
  if (status === 'blocked') return BLOCKED_COLOR
  const tc = TIER_COLORS[tier] || TIER_COLORS.general
  if (status === 'occupied') return tc.occupied
  return tc.unoccupied
}
