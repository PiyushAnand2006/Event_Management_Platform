import { db } from '@/lib/db'

/**
 * Create a notification with 1-minute deduplication.
 * If a notification of the same type for the same user was created
 * within the last 60 seconds, skip creation and return null.
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: object
) {
  const oneMinuteAgo = new Date(Date.now() - 60_000)

  const existing = await db.notification.findFirst({
    where: { userId, type, createdAt: { gte: oneMinuteAgo } },
  })

  if (existing) return null

  return db.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data ? JSON.stringify(data) : null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  })
}
