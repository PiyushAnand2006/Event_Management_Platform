import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear all data in reverse dependency order
  const modelNames = [
    'photo', 'qnAQuestion', 'pollResponse', 'poll',
    'backupVendor', 'foodStall', 'invitation',
    'poi', 'seat', 'venueSection', 'venue',
    'notification', 'bookmark', 'review',
    'registration', 'coOrganizer', 'event',
    'session', 'account', 'user',
  ] as const

  for (const model of modelNames) {
    try {
      await (prisma as Record<string, { deleteMany: () => Promise<unknown> }>)[model].deleteMany()
    } catch {
      // Table may not exist yet
    }
  }

  console.log('  Cleared all existing data')

  // Hash password
  const passwordHash = await bcrypt.hash('password123', 10)

  // Create users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@occasio.com',
      passwordHash,
      role: 'admin',
      bio: 'Platform administrator',
      interests: JSON.stringify(['management', 'technology']),
    },
  })

  const organizer = await prisma.user.create({
    data: {
      name: 'Event Organizer',
      email: 'organizer@occasio.com',
      passwordHash,
      role: 'organizer',
      bio: 'Professional event organizer with 10+ years of experience',
      phone: '+1234567890',
      interests: JSON.stringify(['conferences', 'hackathons', 'networking']),
    },
  })

  const customer = await prisma.user.create({
    data: {
      name: 'Jane Customer',
      email: 'customer@occasio.com',
      passwordHash,
      role: 'customer',
      bio: 'Tech enthusiast and lifelong learner',
      interests: JSON.stringify(['technology', 'design', 'AI']),
    },
  })

  console.log('  Created 3 users:', admin.email, organizer.email, customer.email)

  // Create 5 sample events
  const now = new Date()

  const event1 = await prisma.event.create({
    data: {
      title: 'Tech Summit 2025',
      description: 'A premier technology conference bringing together industry leaders, developers, and innovators from around the world. Features keynotes, workshops, and networking sessions.',
      type: 'conference',
      category: 'Technology',
      date: new Date(now.getFullYear(), now.getMonth() + 2, 15, 9, 0),
      endTime: new Date(now.getFullYear(), now.getMonth() + 2, 15, 18, 0),
      location: 'Grand Convention Center, San Francisco',
      capacity: 500,
      organizerId: organizer.id,
      status: 'published',
      tags: JSON.stringify(['tech', 'ai', 'cloud', 'networking']),
      price: 0,
      isFree: true,
    },
  })

  const event2 = await prisma.event.create({
    data: {
      title: 'Startup Hackathon',
      description: '48-hour hackathon where teams compete to build innovative solutions. Prizes worth $50,000. Mentors from top tech companies will be present.',
      type: 'hackathon',
      category: 'Technology',
      date: new Date(now.getFullYear(), now.getMonth() + 1, 20, 8, 0),
      endTime: new Date(now.getFullYear(), now.getMonth() + 3, 22, 20, 0),
      location: 'Innovation Hub, New York',
      capacity: 200,
      organizerId: organizer.id,
      status: 'approved',
      tags: JSON.stringify(['hackathon', 'startup', 'coding', 'competition']),
      price: 25,
      isFree: false,
    },
  })

  const event3 = await prisma.event.create({
    data: {
      title: 'AI & Machine Learning Workshop',
      description: 'Hands-on workshop covering the latest techniques in artificial intelligence and machine learning. Bring your laptop and get ready to code.',
      type: 'seminar',
      category: 'Education',
      date: new Date(now.getFullYear(), now.getMonth() + 1, 10, 10, 0),
      endTime: new Date(now.getFullYear(), now.getMonth() + 1, 10, 16, 0),
      location: 'University Auditorium, Boston',
      capacity: 100,
      organizerId: organizer.id,
      status: 'published',
      tags: JSON.stringify(['AI', 'ML', 'workshop', 'deep-learning']),
      price: 0,
      isFree: true,
    },
  })

  const event4 = await prisma.event.create({
    data: {
      title: 'Sarah & James Wedding',
      description: 'Join us for a beautiful celebration of love. Reception to follow the ceremony at the Rose Garden Pavilion.',
      type: 'wedding',
      category: 'Social',
      date: new Date(now.getFullYear(), now.getMonth() + 3, 5, 14, 0),
      endTime: new Date(now.getFullYear(), now.getMonth() + 3, 5, 23, 0),
      location: 'Rose Garden Estate, Napa Valley',
      capacity: 150,
      organizerId: organizer.id,
      status: 'pending',
      tags: JSON.stringify(['wedding', 'celebration', 'private']),
      price: 0,
      isFree: true,
    },
  })

  const event5 = await prisma.event.create({
    data: {
      title: 'Design Thinking Masterclass',
      description: 'An intensive full-day masterclass on design thinking methodologies. Learn to apply design principles to product development and problem solving.',
      type: 'seminar',
      category: 'Education',
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      endTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      location: 'Design Studio, Austin',
      capacity: 50,
      organizerId: organizer.id,
      status: 'rejected',
      tags: JSON.stringify(['design', 'UX', 'workshop']),
      price: 75,
      isFree: false,
    },
  })

  console.log('  Created 5 events:', event1.title, event2.title, event3.title, event4.title, event5.title)

  // Create registrations
  const reg1 = await prisma.registration.create({
    data: {
      userId: customer.id,
      eventId: event1.id,
      status: 'registered',
      tier: 'general',
    },
  })

  const reg2 = await prisma.registration.create({
    data: {
      userId: customer.id,
      eventId: event2.id,
      status: 'registered',
      tier: 'general',
      paymentStatus: 'paid',
    },
  })

  const reg3 = await prisma.registration.create({
    data: {
      userId: customer.id,
      eventId: event3.id,
      status: 'waitlisted',
      tier: 'general',
    },
  })

  console.log('  Created 3 registrations for', customer.email)

  // Update registered counts
  await prisma.event.update({
    where: { id: event1.id },
    data: { registeredCount: 1 },
  })
  await prisma.event.update({
    where: { id: event2.id },
    data: { registeredCount: 1 },
  })

  // Create notifications
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + 30)

  const notif1 = await prisma.notification.create({
    data: {
      userId: customer.id,
      type: 'registration_confirmed',
      title: 'Registration Confirmed',
      message: 'You are registered for Tech Summit 2025!',
      data: JSON.stringify({ eventId: event1.id }),
      isRead: false,
      expiresAt: futureDate,
    },
  })

  const notif2 = await prisma.notification.create({
    data: {
      userId: organizer.id,
      type: 'event_approved',
      title: 'Event Approved',
      message: 'Your event "Tech Summit 2025" has been approved and is now published.',
      data: JSON.stringify({ eventId: event1.id }),
      isRead: true,
      expiresAt: futureDate,
    },
  })

  const notif3 = await prisma.notification.create({
    data: {
      userId: customer.id,
      type: 'waitlist_promoted',
      title: 'Spot Available',
      message: 'A spot has opened up for AI & Machine Learning Workshop. You are no longer on the waitlist.',
      data: JSON.stringify({ eventId: event3.id }),
      isRead: false,
      expiresAt: futureDate,
    },
  })

  console.log('  Created 3 notifications')

  console.log('')
  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('Test Accounts:')
  console.log('  Admin:     admin@occasio.com / password123')
  console.log('  Organizer: organizer@occasio.com / password123')
  console.log('  Customer:  customer@occasio.com / password123')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
