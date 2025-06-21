/**
 * Gallery Tracking Service
 * 
 * Handles user interaction tracking for gallery pages.
 * Features:
 * - Session management with automatic session ID generation
 * - Queue-based tracking with batch processing
 * - Error tolerance (tracking failures don't affect user experience)
 * - Automatic retry for failed requests
 */

interface TrackingData {
  code: string
  interaction_type: 'gallery_open' | 'photo_view' | 'photo_download' | 'photo_share' | 'gallery_search'
  session_id: string
  photo_id?: string
  user_id?: string
  context?: Record<string, any>
}

interface QueuedEvent extends TrackingData {
  timestamp: number
  retries: number
}

class GalleryTrackingService {
  private baseUrl: string
  private sessionId: string | null = null
  private code: string | null = null
  private eventQueue: QueuedEvent[] = []
  private isProcessing = false
  private maxRetries = 3
  private batchSize = 5
  private batchInterval = 5000 // 5 seconds

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
    
    // Start batch processing interval
    this.startBatchProcessor()
  }

  /**
   * Initialize tracking for a gallery session
   */
  initializeSession(code: string): string {
    this.code = code
    
    // Generate session ID: {code}-{timestamp}-{random}
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    this.sessionId = `${code}-${timestamp}-${random}`
    
    // Store session info in sessionStorage for persistence
    sessionStorage.setItem('gallery_session_id', this.sessionId)
    sessionStorage.setItem('gallery_code', code)
    sessionStorage.setItem('gallery_session_start', timestamp.toString())
    
    return this.sessionId
  }

  /**
   * Get current session ID, restoring from storage if needed
   */
  private getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = sessionStorage.getItem('gallery_session_id')
      this.code = sessionStorage.getItem('gallery_code')
    }
    
    if (!this.sessionId || !this.code) {
      throw new Error('Gallery session not initialized. Call initializeSession() first.')
    }
    
    return this.sessionId
  }

  /**
   * Track a gallery interaction
   */
  async trackInteraction(
    interactionType: TrackingData['interaction_type'],
    options: {
      photo_id?: string
      user_id?: string
      context?: Record<string, any>
      immediate?: boolean // If true, send immediately instead of queuing
    } = {}
  ): Promise<void> {
    try {
      const sessionId = this.getSessionId()
      
      if (!this.code) {
        console.warn('Gallery tracking: No code available')
        return
      }

      const trackingData: TrackingData = {
        code: this.code,
        interaction_type: interactionType,
        session_id: sessionId,
        photo_id: options.photo_id,
        user_id: options.user_id,
        context: {
          ...options.context,
          timestamp: Date.now(),
          user_agent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      }

      if (options.immediate) {
        // Send immediately for high-priority events
        await this.sendTrackingData(trackingData)
      } else {
        // Queue for batch processing
        this.queueEvent(trackingData)
      }
    } catch (error) {
      // Silent fail - tracking should never disrupt user experience
      console.warn('Gallery tracking failed:', error)
    }
  }

  /**
   * Convenience methods for common interactions
   */
  async trackGalleryOpen(context?: Record<string, any>): Promise<void> {
    await this.trackInteraction('gallery_open', { context, immediate: true })
  }

  async trackPhotoView(photoId: string, context?: Record<string, any>): Promise<void> {
    await this.trackInteraction('photo_view', { photo_id: photoId, context })
  }

  async trackPhotoDownload(photoId: string, context?: Record<string, any>): Promise<void> {
    await this.trackInteraction('photo_download', { photo_id: photoId, context, immediate: true })
  }

  async trackPhotoShare(photoId: string, context?: Record<string, any>): Promise<void> {
    await this.trackInteraction('photo_share', { photo_id: photoId, context, immediate: true })
  }

  async trackGallerySearch(filterType: string, context?: Record<string, any>): Promise<void> {
    await this.trackInteraction('gallery_search', { 
      context: { filter: filterType, ...context }
    })
  }

  /**
   * Queue an event for batch processing
   */
  private queueEvent(data: TrackingData): void {
    const event: QueuedEvent = {
      ...data,
      timestamp: Date.now(),
      retries: 0
    }
    
    this.eventQueue.push(event)
    
    // If queue is full, process immediately
    if (this.eventQueue.length >= this.batchSize) {
      this.processBatch()
    }
  }

  /**
   * Start the batch processor interval
   */
  private startBatchProcessor(): void {
    setInterval(() => {
      if (this.eventQueue.length > 0 && !this.isProcessing) {
        this.processBatch()
      }
    }, this.batchInterval)
  }

  /**
   * Process queued events in batch
   */
  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return
    }

    this.isProcessing = true
    
    try {
      // Process events in batches
      const batch = this.eventQueue.splice(0, this.batchSize)
      
      // Send each event (API doesn't support batch, so send individually)
      const promises = batch.map(event => this.sendQueuedEvent(event))
      await Promise.allSettled(promises)
      
    } catch (error) {
      console.warn('Batch processing failed:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Send a queued event with retry logic
   */
  private async sendQueuedEvent(event: QueuedEvent): Promise<void> {
    try {
      await this.sendTrackingData(event)
    } catch (error) {
      // Retry logic for failed events
      if (event.retries < this.maxRetries) {
        event.retries++
        this.eventQueue.push(event) // Re-queue for retry
      } else {
        // Store failed events in localStorage for potential retry on next session
        this.storeFailedEvent(event)
      }
    }
  }

  /**
   * Send tracking data to the API
   */
  private async sendTrackingData(data: TrackingData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/gallery/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Tracking request failed: ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(`Tracking failed: ${result.message}`)
    }
  }

  /**
   * Store failed events for retry on next session
   */
  private storeFailedEvent(event: QueuedEvent): void {
    try {
      const failedEvents = JSON.parse(localStorage.getItem('gallery_failed_events') || '[]')
      failedEvents.push(event)
      
      // Keep only last 50 failed events to prevent storage bloat
      if (failedEvents.length > 50) {
        failedEvents.splice(0, failedEvents.length - 50)
      }
      
      localStorage.setItem('gallery_failed_events', JSON.stringify(failedEvents))
    } catch (error) {
      console.warn('Failed to store failed event:', error)
    }
  }

  /**
   * Retry failed events from previous sessions
   */
  async retryFailedEvents(): Promise<void> {
    try {
      const failedEvents = JSON.parse(localStorage.getItem('gallery_failed_events') || '[]')
      
      if (failedEvents.length === 0) {
        return
      }

      // Try to send failed events
      const promises = failedEvents.map((event: QueuedEvent) => 
        this.sendTrackingData(event).catch(() => {
          // Keep failed events that still fail
          return event
        })
      )

      const results = await Promise.allSettled(promises)
      
      // Remove successfully sent events
      const stillFailedEvents = results
        .filter((result, index) => result.status === 'rejected')
        .map((_, index) => failedEvents[index])

      localStorage.setItem('gallery_failed_events', JSON.stringify(stillFailedEvents))
      
    } catch (error) {
      console.warn('Failed to retry failed events:', error)
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    sessionId: string | null
    code: string | null
    startTime: number | null
    eventsQueued: number
  } {
    const startTime = sessionStorage.getItem('gallery_session_start')
    
    return {
      sessionId: this.sessionId,
      code: this.code,
      startTime: startTime ? parseInt(startTime) : null,
      eventsQueued: this.eventQueue.length
    }
  }

  /**
   * Flush all queued events immediately
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length > 0) {
      await this.processBatch()
    }
  }

  /**
   * Clean up session data
   */
  cleanup(): void {
    sessionStorage.removeItem('gallery_session_id')
    sessionStorage.removeItem('gallery_code')
    sessionStorage.removeItem('gallery_session_start')
    this.sessionId = null
    this.code = null
    this.eventQueue = []
  }
}

// Export singleton instance
export const galleryTrackingService = new GalleryTrackingService()
export default galleryTrackingService 