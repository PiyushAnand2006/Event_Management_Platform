import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function getServerUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }
  return session.user
}

export function parseJsonField<T = unknown>(field: string | null | undefined, fallback: T): T {
  if (!field) return fallback
  try {
    return JSON.parse(field) as T
  } catch {
    return fallback
  }
}

export function toJsonField<T>(value: T): string {
  return JSON.stringify(value)
}
