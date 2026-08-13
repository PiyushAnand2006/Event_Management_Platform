'use client'

import { useState, useEffect } from 'react'
import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

function getSnapshot() {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

function getServerSnapshot() {
  return true
}

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
