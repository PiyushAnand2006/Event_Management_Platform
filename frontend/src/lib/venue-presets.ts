export interface SeatLayout {
  label: string
  x: number
  y: number
  tier: 'vip' | 'reserved' | 'general'
  groupId?: string
}

export interface VenuePreset {
  id: string
  name: string
  description: string
  icon: string // lucide icon name
  defaultWidth: number
  defaultHeight: number
  generateSeats: (sectionId: string, offsetX: number, offsetY: number) => SeatLayout[]
}

export const venuePresets: Record<string, VenuePreset> = {
  theatre: {
    id: 'theatre',
    name: 'Theatre Rows',
    description: 'Straight rows facing a stage',
    icon: 'AlignVerticalSpaceAround',
    defaultWidth: 30,
    defaultHeight: 20,
    generateSeats: (_sectionId, offsetX, offsetY) => {
      const seats: SeatLayout[] = []
      const rows = 8
      const cols = 12
      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r)
        for (let c = 0; c < cols; c++) {
          const tier = r < 2 ? 'vip' : r < 4 ? 'reserved' : 'general'
          seats.push({
            label: `${rowLabel}${c + 1}`,
            x: offsetX + 2 + c * 2.5,
            y: offsetY + 2 + r * 2,
            tier,
          })
        }
      }
      return seats
    },
  },
  round_table: {
    id: 'round_table',
    name: 'Round Tables',
    description: 'Wedding-style round table seating',
    icon: 'Circle',
    defaultWidth: 25,
    defaultHeight: 25,
    generateSeats: (_sectionId, offsetX, offsetY) => {
      const seats: SeatLayout[] = []
      const tables = 6
      const seatsPerTable = 8
      const tableSpacing = 8
      for (let t = 0; t < tables; t++) {
        const col = t % 3
        const row = Math.floor(t / 3)
        const tableCenterX = offsetX + 4 + col * tableSpacing
        const tableCenterY = offsetY + 4 + row * tableSpacing
        const tier = row === 0 ? 'vip' : row === 1 ? 'reserved' : 'general'
        for (let s = 0; s < seatsPerTable; s++) {
          const angle = (s / seatsPerTable) * 2 * Math.PI
          const radius = 2.5
          seats.push({
            label: `T${t + 1}-${s + 1}`,
            x: tableCenterX + Math.cos(angle) * radius,
            y: tableCenterY + Math.sin(angle) * radius,
            tier,
            groupId: `table_${t + 1}`,
          })
        }
      }
      return seats
    },
  },
  classroom: {
    id: 'classroom',
    name: 'Classroom',
    description: 'Tables with chairs facing front',
    icon: 'LayoutGrid',
    defaultWidth: 30,
    defaultHeight: 20,
    generateSeats: (_sectionId, offsetX, offsetY) => {
      const seats: SeatLayout[] = []
      const rows = 4
      const tablesPerRow = 6
      for (let r = 0; r < rows; r++) {
        for (let t = 0; t < tablesPerRow; t++) {
          const tier = r === 0 ? 'vip' : 'general'
          seats.push({
            label: `R${r + 1}T${t + 1}A`,
            x: offsetX + 2 + t * 5,
            y: offsetY + 2 + r * 4,
            tier,
            groupId: `R${r + 1}T${t + 1}`,
          })
          seats.push({
            label: `R${r + 1}T${t + 1}B`,
            x: offsetX + 2 + t * 5 + 1.5,
            y: offsetY + 2 + r * 4,
            tier,
            groupId: `R${r + 1}T${t + 1}`,
          })
        }
      }
      return seats
    },
  },
  banquet: {
    id: 'banquet',
    name: 'Banquet',
    description: 'Long banquet tables in rows',
    icon: 'RectangleHorizontal',
    defaultWidth: 35,
    defaultHeight: 20,
    generateSeats: (_sectionId, offsetX, offsetY) => {
      const seats: SeatLayout[] = []
      const tables = 2
      const seatsPerSide = 8
      for (let t = 0; t < tables; t++) {
        const tier = t === 0 ? 'vip' : 'reserved'
        const tableY = offsetY + 4 + t * 8
        for (let s = 0; s < seatsPerSide; s++) {
          seats.push({
            label: `L${t + 1}-${s + 1}`,
            x: offsetX + 2 + s * 4,
            y: tableY,
            tier,
            groupId: `banquet_${t + 1}`,
          })
          seats.push({
            label: `L${t + 1}-${s + 1 + seatsPerSide}`,
            x: offsetX + 2 + s * 4,
            y: tableY + 3,
            tier,
            groupId: `banquet_${t + 1}`,
          })
        }
      }
      return seats
    },
  },
}

export const sectionShapes = ['rectangle', 'circle'] as const
export type SectionShape = typeof sectionShapes[number]

export const seatTiers = [
  { id: 'vip', label: 'VIP', color: '#EAB308' },
  { id: 'reserved', label: 'Reserved', color: '#14B8A6' },
  { id: 'general', label: 'General', color: '#6B7280' },
] as const

export const seatStatuses = [
  { id: 'unoccupied', label: 'Unoccupied', color: '#22C55E' },
  { id: 'occupied', label: 'Occupied', color: '#3B82F6' },
  { id: 'blocked', label: 'Blocked', color: '#EF4444' },
] as const

export const poiTypes = [
  { id: 'food_stall', label: 'Food Stall', icon: 'UtensilsCrossed' },
  { id: 'restroom', label: 'Restroom', icon: 'Bath' },
  { id: 'entrance', label: 'Entrance', icon: 'DoorOpen' },
  { id: 'stage', label: 'Stage', icon: 'Presentation' },
  { id: 'seating_section', label: 'Seating Section', icon: 'Armchair' },
  { id: 'other', label: 'Other', icon: 'MapPin' },
] as const
