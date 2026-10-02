import { db } from '@/lib/db'
import { successResponse, errorResponse, getServerUser, toJsonField, parseJsonField } from '@/lib/api-utils'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const type = searchParams.get('type') || ''
    const category = searchParams.get('category') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const sort = searchParams.get('sort') || 'date'

    const user = await getServerUser()
    const isAdmin = user?.role === 'admin'
    const isOrganizer = user?.role === 'organizer'

    // Build where clause
    const where: Prisma.EventWhereInput = {}

    // Public users see only published events; admins see all, organizers see their own
    if (isAdmin) {
      // Admin sees everything, no status filter
    } else if (isOrganizer && user) {
      // Organizers see published events + their own events
      where.OR = [
        { status: 'published' },
        { organizerId: user.id },
      ]
    } else {
      where.status = 'published'
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { location: { contains: q } },
      ]
    }
    if (type) {
      where.type = type
    }
    if (category) {
      where.category = category
    }
    if (dateFrom) {
      where.date = { ...(where.date as Prisma.DateTimeNullableFilter | undefined), gte: new Date(dateFrom) }
    }
    if (dateTo) {
      where.date = { ...(where.date as Prisma.DateTimeNullableFilter | undefined), lte: new Date(dateTo) }
    }

    // Sorting
    let orderBy: Prisma.EventOrderByWithRelationInput
    switch (sort) {
      case 'rating':
        orderBy = { averageRating: 'desc' }
        break
      case 'registrations':
        orderBy = { registeredCount: 'desc' }
        break
      default:
        orderBy = { date: 'asc' }
    }

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          organizer: { select: { id: true, name: true, image: true } },
          _count: { select: { reviews: true, bookmarks: true } },
        },
      }),
      db.event.count({ where }),
    ])

    return successResponse({
      events: events.map((e) => ({
        ...e,
        tags: parseJsonField<string[]>(e.tags, []),
        coordinates: e.coordinates ? parseJsonField(e.coordinates, null) : null,
        reviewCount: e._count.reviews,
        bookmarkCount: e._count.bookmarks,
        _count: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/events error:', error)
    return errorResponse('Failed to fetch events', 500)
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'organizer' && user.role !== 'admin') {
      return errorResponse('Only organizers and admins can create events', 403)
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      date,
      location,
      type,
      endTime,
      capacity,
      price,
      tags,
      coordinates,
      posterUrl,
    } = body

    if (!title?.trim()) return errorResponse('Title is required', 400)
    if (!description?.trim()) return errorResponse('Description is required', 400)
    if (!category?.trim()) return errorResponse('Category is required', 400)
    if (!date) return errorResponse('Event date is required', 400)
    if (!location?.trim()) return errorResponse('Location is required', 400)

    const validTypes = ['conference', 'seminar', 'hackathon', 'wedding', 'private_ceremony', 'other']
    const eventType = type && validTypes.includes(type) ? type : 'conference'

    const eventPrice = Math.max(0, parseFloat(price) || 0)
    const eventCapacity = Math.max(0, parseInt(capacity, 10) || 0)

    // Safely parse start date
    const startDate = new Date(date)
    if (isNaN(startDate.getTime())) {
      return errorResponse('Invalid event start date', 400)
    }

    // Safely parse end time
    let parsedEndTime: Date | null = null
    if (endTime) {
      if (typeof endTime === 'string' && endTime.includes(':') && !endTime.includes('-')) {
        const dateStr = startDate.toISOString().split('T')[0]
        parsedEndTime = new Date(`${dateStr}T${endTime}`)
      } else {
        parsedEndTime = new Date(endTime)
      }
      if (isNaN(parsedEndTime.getTime())) {
        parsedEndTime = null
      }
    }

    const event = await db.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        type: eventType,
        category: category.trim(),
        date: startDate,
        endTime: parsedEndTime,
        location: location.trim(),
        coordinates: coordinates ? JSON.stringify(coordinates) : null,
        capacity: eventCapacity,
        registeredCount: 0,
        organizerId: user.id,
        posterUrl: posterUrl || null,
        status: 'published',
        tags: toJsonField(tags || []),
        price: eventPrice,
        isFree: eventPrice === 0,
      },
    })

    return successResponse({
      ...event,
      tags: parseJsonField<string[]>(event.tags, []),
      coordinates: event.coordinates ? parseJsonField(event.coordinates, null) : null,
    }, 201)
  } catch (error) {
    console.error('POST /api/events error:', error)
    return errorResponse('Failed to create event', 500)
  }
}
