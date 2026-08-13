import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role === 'organizer' ? 'organizer' : 'customer',
        interests: '[]',
      },
    })

    return NextResponse.json(
      { message: 'Account created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
