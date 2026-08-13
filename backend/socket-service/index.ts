import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

const rooms = new Map<string, Set<string>>() // roomId -> Set of socketIds
const userSockets = new Map<string, string>() // userId -> socketId

function joinRoom(socketId: string, roomId: string) {
  socket.join(roomId)
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set())
  }
  rooms.get(roomId)!.add(socketId)
}

function leaveRoom(socketId: string, roomId: string) {
  socket.leave(roomId)
  rooms.get(roomId)?.delete(socketId)
  if (rooms.get(roomId)?.size === 0) {
    rooms.delete(roomId)
  }
}

function leaveAllRooms(socketId: string) {
  rooms.forEach((_, roomId) => leaveRoom(socketId, roomId))
}

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`)

  // User joins their personal room
  socket.on('user:join', (data: { userId: string }) => {
    const { userId } = data
    userSockets.set(userId, socket.id)
    joinRoom(socket.id, `user:${userId}`)
    console.log(`[Socket] User ${userId} joined their room`)
  })

  // Event room (for event-level broadcasts)
  socket.on('event:join', (data: { eventId: string }) => {
    joinRoom(socket.id, `event:${data.eventId}`)
    console.log(`[Socket] ${socket.id} joined event:${data.eventId}`)
  })

  socket.on('event:leave', (data: { eventId: string }) => {
    leaveRoom(socket.id, `event:${data.eventId}`)
  })

  // Staff-only sub-room (organizer/admin)
  socket.on('event:staff:join', (data: { eventId: string }) => {
    joinRoom(socket.id, `event:${data.eventId}:staff`)
  })

  // Notification relay (server → client)
  socket.on('notification:read', (data: { userId: string; notificationId: string }) => {
    // No-op for now; handled via REST API
  })

  // Generic broadcast to event room
  socket.on('event:broadcast', (data: { eventId: string; event: string; payload: unknown }) => {
    io.to(`event:${data.eventId}`).emit(data.event, data.payload)
  })

  // Generic broadcast to staff sub-room
  socket.on('event:staff:broadcast', (data: { eventId: string; event: string; payload: unknown }) => {
    io.to(`event:${data.eventId}:staff`).emit(data.event, data.payload)
  })

  // Registration count update
  socket.on('registration:count', (data: { eventId: string; count: number }) => {
    io.to(`event:${data.eventId}`).emit('registration:count', { eventId: data.eventId, count: data.count })
  })

  // Seat update event (single seat)
  socket.on('seat:update', (data: { eventId: string; seatId: string; status: string; assignedGuestId?: string }) => {
    const { eventId, seatId, status, assignedGuestId } = data
    socket.to(`event:${eventId}`).emit('seat:update', { seatId, status, assignedGuestId })
  })

  // Seat bulk sync event
  socket.on('seat:bulk-sync', (data: { eventId: string; seats: Array<{ id: string; status: string; assignedGuestId?: string }> }) => {
    const { eventId, seats } = data
    socket.to(`event:${eventId}`).emit('seat:bulk-sync', { seats })
  })

  // POI update event (organizer sends, lobby clients receive)
  socket.on('poi:update', (data: { eventId: string; poiId: string; action: 'add' | 'update' | 'delete'; poi?: object }) => {
    const { eventId, poiId, action, poi } = data
    socket.to(`event:${eventId}`).emit('lobby:poi-update', { poiId, action, poi })
  })

  // Check-in scan
  socket.on('checkin:scan', (data: { eventId: string; token: string }) => {
    // Forward to staff room for organizer dashboard display
    io.to(`event:${data.eventId}:staff`).emit('checkin:scan', data)
  })

  socket.on('checkin:success', (data: { eventId: string; payload: unknown }) => {
    io.to(`event:${data.eventId}`).emit('checkin:success', data.payload)
    io.to(`event:${data.eventId}:staff`).emit('checkin:success', data.payload)
  })

  socket.on('checkin:failed', (data: { eventId: string; payload: unknown }) => {
    io.to(`event:${data.eventId}:staff`).emit('checkin:failed', data.payload)
  })

  // Vendor fallback alerts
  socket.on('vendor:fallback-triggered', (data: { eventId: string; payload: unknown }) => {
    io.to(`event:${data.eventId}:staff`).emit('vendor:fallback-triggered', data.payload)
  })

  socket.on('vendor:fallback-resolved', (data: { eventId: string; payload: unknown }) => {
    io.to(`event:${data.eventId}:staff`).emit('vendor:fallback-resolved', data.payload)
  })

  // Invite send progress
  socket.on('invite:send-progress', (data: { eventId: string; progress: unknown }) => {
    io.to(`event:${data.eventId}:staff`).emit('invite:send-progress', data.progress)
  })

  // Poll events
  socket.on('poll:new', (data: { eventId: string; payload: unknown }) => {
    io.to(`event:${data.eventId}`).emit('poll:new', data.payload)
  })

  socket.on('poll:vote', (data: { eventId: string; payload: unknown }) => {
    io.to(`event:${data.eventId}`).emit('poll:results', data.payload)
  })

  // Q&A events
  socket.on('qna:new-question', (data: { eventId: string; payload: unknown }) => {
    io.to(`event:${data.eventId}:staff`).emit('qna:new-question', data.payload)
  })

  socket.on('qna:approved', (data: { eventId: string; payload: unknown }) => {
    io.to(`event:${data.eventId}`).emit('qna:approved', data.payload)
  })

  // Photo events
  socket.on('photo:new-upload', (data: { eventId: string; payload: unknown }) => {
    io.to(`event:${data.eventId}:staff`).emit('photo:new-upload', data.payload)
  })

  socket.on('photo:approved', (data: { eventId: string; payload: unknown }) => {
    io.to(`event:${data.eventId}`).emit('photo:approved', data.payload)
  })

  // Lobby POI updates (forwarded from organizer to event room)
  socket.on('lobby:poi-update', (data: { eventId: string; poiId: string; action: 'add' | 'update' | 'delete'; poi?: object }) => {
    socket.to(`event:${data.eventId}`).emit('lobby:poi-update', { poiId: data.poiId, action: data.action, poi: data.poi })
  })

  // Stall update event (broadcast stall status changes to event room)
  socket.on('stall:update', (data: { eventId: string; stallId: string; contractStatus: string; stall?: object }) => {
    const { eventId, stallId, contractStatus, stall } = data
    io.to(`event:${eventId}`).emit('stall:update', { stallId, contractStatus, stall })
  })

  // Notification push
  socket.on('notification:push', (data: { userId: string; notification: unknown }) => {
    io.to(`user:${data.userId}`).emit('notification:new', data.notification)
  })

  // Disconnect
  socket.on('disconnect', () => {
    leaveAllRooms(socket.id)
    // Clean up userSockets
    for (const [userId, sId] of userSockets.entries()) {
      if (sId === socket.id) {
        userSockets.delete(userId)
        break
      }
    }
    console.log(`[Socket] Disconnected: ${socket.id}`)
  })

  socket.on('error', (error) => {
    console.error(`[Socket] Error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[Occasio Socket] Real-time service running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Occasio Socket] Shutting down...')
  httpServer.close(() => {
    console.log('[Occasio Socket] Closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[Occasio Socket] Shutting down...')
  httpServer.close(() => {
    console.log('[Occasio Socket] Closed')
    process.exit(0)
  })
})
