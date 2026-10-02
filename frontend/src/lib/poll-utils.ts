import { parseJsonField } from '@/lib/api-utils'

export type PollOptionResult = { index: number; text: string; votes: number }
export type PollResults = {
  options: PollOptionResult[]
  totalResponses: number
  totalVotes: number
}

/**
 * Tallies a poll's responses into per-option vote counts.
 *
 * Options and selected options are both stored as JSON strings, so they have to
 * be parsed. Out-of-range indexes are ignored so a malformed stored selection
 * cannot produce an undefined vote count.
 */
export function computePollResults(
  poll: { options: string },
  responses: { selectedOptions: string }[]
): PollResults {
  const options = parseJsonField<string[]>(poll.options, [])

  const voteCounts: number[] = options.map(() => 0)
  let totalVotes = 0

  for (const resp of responses) {
    const selected = parseJsonField<number[]>(resp.selectedOptions, [])
    for (const idx of selected) {
      if (Number.isInteger(idx) && idx >= 0 && idx < options.length) {
        voteCounts[idx] += 1
        totalVotes += 1
      }
    }
  }

  return {
    options: options.map((text, idx) => ({ index: idx, text, votes: voteCounts[idx] })),
    totalResponses: responses.length,
    totalVotes
  }
}
