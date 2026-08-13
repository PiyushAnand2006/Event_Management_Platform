'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
})

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Only connect when authenticated
    if (status !== 'authenticated' || !session?.user?.email) return

    const newSocket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      setSocket(newSocket)
      // Join user-specific room
      newSocket.emit('user:join', session.user.email)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('connect_error', () => {
      setIsConnected(false)
    })

    return () => {
      newSocket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [status, session?.user?.email])

  const value: SocketContextValue = {
    socket,
    isConnected,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
