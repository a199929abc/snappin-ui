/**
 * useGalleryTracking Hook
 * 
 * React hook that provides gallery tracking functionality to components.
 * Handles initialization, cleanup, and provides convenient tracking methods.
 */

import { useEffect, useCallback, useRef } from 'react'
import { galleryTrackingService } from '@/services/galleryTrackingService'

interface UseGalleryTrackingOptions {
  code?: string
  autoInitialize?: boolean
  enableRetry?: boolean
}

interface UseGalleryTrackingReturn {
  trackGalleryOpen: (context?: Record<string, any>) => Promise<void>
  trackPhotoView: (photoId: string, context?: Record<string, any>) => Promise<void>
  trackPhotoDownload: (photoId: string, context?: Record<string, any>) => Promise<void>
  trackPhotoShare: (photoId: string, context?: Record<string, any>) => Promise<void>
  trackGallerySearch: (filterType: string, context?: Record<string, any>) => Promise<void>
  initializeSession: (code: string) => string
  getSessionStats: () => {
    sessionId: string | null
    code: string | null
    startTime: number | null
    eventsQueued: number
  }
  isInitialized: boolean
}

export const useGalleryTracking = (
  options: UseGalleryTrackingOptions = {}
): UseGalleryTrackingReturn => {
  const { code, autoInitialize = true, enableRetry = true } = options
  const isInitializedRef = useRef(false)
  const codeRef = useRef<string | null>(null)

  // Initialize session when component mounts or code changes
  useEffect(() => {
    if (code && autoInitialize && code !== codeRef.current) {
      galleryTrackingService.initializeSession(code)
      isInitializedRef.current = true
      codeRef.current = code

      // Retry failed events from previous sessions
      if (enableRetry) {
        galleryTrackingService.retryFailedEvents().catch(error => {
          console.warn('Failed to retry previous events:', error)
        })
      }
    }
  }, [code, autoInitialize, enableRetry])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Flush any remaining events before cleanup
      galleryTrackingService.flush().catch(error => {
        console.warn('Failed to flush tracking events:', error)
      })
    }
  }, [])

  // Tracking methods with error handling
  const trackGalleryOpen = useCallback(async (context?: Record<string, any>) => {
    try {
      await galleryTrackingService.trackGalleryOpen(context)
    } catch (error) {
      console.warn('trackGalleryOpen failed:', error)
    }
  }, [])

  const trackPhotoView = useCallback(async (photoId: string, context?: Record<string, any>) => {
    try {
      await galleryTrackingService.trackPhotoView(photoId, context)
    } catch (error) {
      console.warn('trackPhotoView failed:', error)
    }
  }, [])

  const trackPhotoDownload = useCallback(async (photoId: string, context?: Record<string, any>) => {
    try {
      await galleryTrackingService.trackPhotoDownload(photoId, context)
    } catch (error) {
      console.warn('trackPhotoDownload failed:', error)
    }
  }, [])

  const trackPhotoShare = useCallback(async (photoId: string, context?: Record<string, any>) => {
    try {
      await galleryTrackingService.trackPhotoShare(photoId, context)
    } catch (error) {
      console.warn('trackPhotoShare failed:', error)
    }
  }, [])

  const trackGallerySearch = useCallback(async (filterType: string, context?: Record<string, any>) => {
    try {
      await galleryTrackingService.trackGallerySearch(filterType, context)
    } catch (error) {
      console.warn('trackGallerySearch failed:', error)
    }
  }, [])

  const initializeSession = useCallback((code: string) => {
    const sessionId = galleryTrackingService.initializeSession(code)
    isInitializedRef.current = true
    codeRef.current = code
    return sessionId
  }, [])

  const getSessionStats = useCallback(() => {
    return galleryTrackingService.getSessionStats()
  }, [])

  return {
    trackGalleryOpen,
    trackPhotoView,
    trackPhotoDownload,
    trackPhotoShare,
    trackGallerySearch,
    initializeSession,
    getSessionStats,
    isInitialized: isInitializedRef.current
  }
} 