/**
 * Calculate refund based on how far in advance the cancellation occurs.
 *
 * Rules:
 * - After event start: 0% refund
 * - < 24 hours before event: 0% refund
 * - 2–7 days before event: 50% refund
 * - > 7 days before event: 100% refund
 */
export function calculateRefund(
  eventDate: Date,
  _registrationCreatedAt: Date,
  price: number
): { percentage: number; amount: number; status: 'full' | 'partial' | 'none' } {
  const now = new Date()
  const eventStart = new Date(eventDate)

  // After event has started → no refund
  if (now >= eventStart) {
    return { percentage: 0, amount: 0, status: 'none' }
  }

  const msPerHour = 60 * 60 * 1000
  const msPerDay = 24 * msPerHour
  const diffMs = eventStart.getTime() - now.getTime()
  const hoursBefore = diffMs / msPerHour
  const daysBefore = diffMs / msPerDay

  // < 24 hours → no refund
  if (hoursBefore < 24) {
    return { percentage: 0, amount: 0, status: 'none' }
  }

  // 2–7 days → 50% refund
  if (daysBefore >= 2 && daysBefore <= 7) {
    const amount = Math.round((price * 50) / 100 * 100) / 100
    return { percentage: 50, amount, status: 'partial' }
  }

  // > 7 days → full refund
  if (daysBefore > 7) {
    const amount = Math.round(price * 100) / 100
    return { percentage: 100, amount, status: 'full' }
  }

  // Between 24 hours and 2 days → no refund (falls in the gap)
  return { percentage: 0, amount: 0, status: 'none' }
}
