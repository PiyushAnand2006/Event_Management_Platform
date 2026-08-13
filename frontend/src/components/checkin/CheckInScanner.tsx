'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'

type CheckInScannerProps = {
  onScan: (decodedText: string) => void
  onError?: (error: string) => void
  active?: boolean
}

const SCANNER_ID = 'occasio-checkin-scanner'
const COOLDOWN_MS = 2000

type ScannerStatus = 'pending' | 'scanning' | 'error' | 'denied'
type DisplayState = 'idle' | 'starting' | 'scanning' | 'cooldown' | 'error' | 'denied'

export default function CheckInScanner({
  onScan,
  onError,
  active = true,
}: CheckInScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cooldownRef = useRef(false)
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)

  // Ref updates in effect to avoid "refs during render" lint
  useEffect(() => {
    onScanRef.current = onScan
    onErrorRef.current = onError
  })

  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>('pending')
  const [cooldown, setCooldown] = useState(false)

  // Derive display state from props + internal state
  const state: DisplayState = !active
    ? 'idle'
    : scannerStatus === 'pending'
      ? 'starting'
      : cooldown
        ? 'cooldown'
        : scannerStatus

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const s = scannerRef.current.getState()
        if (s === 2) {
          await scannerRef.current.stop()
        }
        await scannerRef.current.clear()
        scannerRef.current = null
      }
    } catch {
      // silently ignore stop errors
    }
  }, [])

  useEffect(() => {
    if (!active) {
      stopScanner()
      // Defer state resets to avoid synchronous setState in effect
      queueMicrotask(() => {
        setScannerStatus('pending')
        setCooldown(false)
      })
      return
    }

    queueMicrotask(() => {
      setScannerStatus('pending')
      setCooldown(false)
    })

    let cancelled = false
    const scanner = new Html5Qrcode(SCANNER_ID)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          if (cooldownRef.current || cancelled) return
          cooldownRef.current = true
          setCooldown(true)
          onScanRef.current(decodedText)

          if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)
          cooldownTimerRef.current = setTimeout(() => {
            cooldownRef.current = false
            if (!cancelled) setCooldown(false)
          }, COOLDOWN_MS)
        },
        (errorMessage) => {
          if (
            !errorMessage.includes('QR code not found') &&
            !errorMessage.includes('No QR code found')
          ) {
            onErrorRef.current?.(errorMessage)
          }
        }
      )
      .then(() => {
        if (!cancelled) setScannerStatus('scanning')
      })
      .catch((err) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : String(err)
        if (
          msg.includes('Permission') ||
          msg.includes('denied') ||
          msg.includes('NotAllowedError')
        ) {
          setScannerStatus('denied')
          onErrorRef.current?.(
            'Camera access denied. Please allow camera permissions.'
          )
        } else {
          setScannerStatus('error')
          onErrorRef.current?.(msg)
        }
      })

    return () => {
      cancelled = true
      stopScanner()
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)
    }
  }, [active, stopScanner])

  return (
    <div
      className={cn(
        'relative w-full rounded-xl overflow-hidden bg-gray-950',
        (state === 'scanning' || state === 'cooldown') &&
          'ring-2 ring-orange-500/50'
      )}
    >
      {/* Scanner container */}
      <div
        ref={containerRef}
        id={SCANNER_ID}
        className="w-full min-h-[300px]"
      />

      {/* Camera denied overlay */}
      {state === 'denied' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 text-gray-300 gap-3">
          <CameraOff className="h-12 w-12 text-red-400" />
          <p className="text-sm font-medium">Camera Access Denied</p>
          <p className="text-xs text-gray-500 max-w-[240px] text-center">
            Please allow camera permissions in your browser settings to use the
            barcode scanner.
          </p>
        </div>
      )}

      {/* Error overlay */}
      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 text-gray-300 gap-3">
          <CameraOff className="h-12 w-12 text-red-400" />
          <p className="text-sm font-medium">Scanner Error</p>
          <p className="text-xs text-gray-500 max-w-[240px] text-center">
            Could not start the camera. Please check your device settings.
          </p>
        </div>
      )}

      {/* Starting overlay */}
      {state === 'starting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 text-gray-300 gap-3">
          <Camera className="h-10 w-10 text-orange-400 animate-pulse" />
          <p className="text-sm font-medium">Starting camera...</p>
        </div>
      )}

      {/* Scan line animation overlay */}
      {(state === 'scanning' || state === 'cooldown') && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
            <ScanLine className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-[11px] text-orange-300 font-medium">
              {state === 'cooldown' ? 'Processing...' : 'Scanning'}
            </span>
          </div>
          {/* Animated scan line */}
          <div
            className={cn(
              'absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent',
              state === 'cooldown'
                ? 'top-1/2 animate-pulse'
                : 'animate-scan-line'
            )}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes scan-line {
          0% { top: 15%; }
          50% { top: 80%; }
          100% { top: 15%; }
        }
        .animate-scan-line {
          animation: scan-line 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
