import { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Container, ThemeProvider, createTheme, Alert, Snackbar, CircularProgress, Fab, Tooltip, useMediaQuery } from '@mui/material'
import { UserGreeting } from '@/components/gallery/UserGreeting'
import { FilterTabs } from '@/components/gallery/FilterTabs'
import { PhotoGrid } from '@/components/gallery/PhotoGrid'
import { PhotoViewer } from '@/components/gallery/PhotoViewer'
import { GalleryFilter, GalleryPhoto, GalleryEvent } from '@/types'
import { apiService } from '@/services/api'
import { useGalleryTracking } from '@/hooks/useGalleryTracking'
import { Share } from '@mui/icons-material'

// Memoize theme to prevent recreation on every render
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#666',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", "Poppins", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
})

// Custom Hook for Pull-to-Refresh (Professional Separation of Concerns)
const usePullToRefresh = (onRefresh: () => Promise<void>, isRefreshing: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const touchDataRef = useRef({
    startY: 0,
    currentPullDistance: 0,
    isDragging: false,
    isEnabled: true
  })
  
  const [pullState, setPullState] = useState<'idle' | 'pulling' | 'ready' | 'refreshing'>('idle')
  const [pullDistance, setPullDistance] = useState(0)

  // Stable configuration
  const config = useMemo(() => ({
    PULL_THRESHOLD: 80,
    MAX_PULL_DISTANCE: 120,
    DAMPING_FACTOR: 0.5
  }), [])

  // Error recovery mechanism
  const recoverEventListeners = useCallback(() => {
    const container = containerRef.current
    if (!container || !touchDataRef.current.isEnabled) return false

    try {
      // Test if container is still in DOM and functional
      const rect = container.getBoundingClientRect()
      return rect.height > 0 && rect.width > 0
    } catch {
      return false
    }
  }, [])

  // Stable refresh handler
  const handleRefresh = useCallback(async () => {
    if (!touchDataRef.current.isEnabled || isRefreshing) return
    
    try {
      setPullState('refreshing')
      await onRefresh()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setPullState('idle')
      setPullDistance(0)
    }
  }, [onRefresh, isRefreshing])

  // Touch event handlers with stable DOM reference
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Reset touch data
    touchDataRef.current = {
      startY: 0,
      currentPullDistance: 0,
      isDragging: false,
      isEnabled: true
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (!recoverEventListeners() || container.scrollTop > 0) return
      
      touchDataRef.current.startY = e.touches[0].clientY
      touchDataRef.current.isDragging = false
      setPullState('idle')
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!recoverEventListeners() || container.scrollTop > 0) return
      if (!touchDataRef.current.isEnabled) return

      const currentY = e.touches[0].clientY
      const diff = currentY - touchDataRef.current.startY

      if (diff > 0) {
        touchDataRef.current.isDragging = true
        touchDataRef.current.currentPullDistance = Math.min(
          diff * config.DAMPING_FACTOR, 
          config.MAX_PULL_DISTANCE
        )
        
        // Update visual state
        setPullDistance(touchDataRef.current.currentPullDistance)
        if (touchDataRef.current.currentPullDistance > config.PULL_THRESHOLD) {
          setPullState('ready')
        } else {
          setPullState('pulling')
        }
      }
    }

    const handleTouchEnd = () => {
      const { isDragging, currentPullDistance } = touchDataRef.current
      
      if (isDragging && currentPullDistance > config.PULL_THRESHOLD) {
        handleRefresh()
      } else {
        setPullState('idle')
        setPullDistance(0)
      }
      
      // Reset touch data
      touchDataRef.current.isDragging = false
      touchDataRef.current.currentPullDistance = 0
    }

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Cleanup function
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)  
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [config, handleRefresh, recoverEventListeners])

  // Disable/enable mechanism for PhotoViewer interference
  const disablePullToRefresh = useCallback(() => {
    touchDataRef.current.isEnabled = false
  }, [])

  const enablePullToRefresh = useCallback(() => {
    touchDataRef.current.isEnabled = true
  }, [])

  return {
    containerRef,
    disablePullToRefresh,
    enablePullToRefresh,
    pullState,
    pullDistance
  }
}

export const GalleryPage = () => {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  
  // Theme and responsive
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [userName, setUserName] = useState('')
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [retentionDays, setRetentionDays] = useState(30)
  const [event, setEvent] = useState<GalleryEvent | null>(null)
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('all')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  
  // Simplified refresh state
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initialize gallery tracking
  const { trackGalleryOpen, trackGallerySearch } = useGalleryTracking({
    code,
    autoInitialize: true,
    enableRetry: true
  })

  // Professional refresh function (Stable, no unnecessary dependencies)
  const performRefresh = useCallback(async () => {
    if (!code || isRefreshing) return

    try {
      setIsRefreshing(true)
      
      // Short delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const data = await apiService.getGallery(code, activeFilter)
      
      // Atomic state update
      setPhotos(data.photos)
      setUserName(data.user.name)
      setTotalPhotos(data.user.totalPhotos)
      setRetentionDays(data.retentionDays)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh gallery'
      setError(errorMessage)
    } finally {
      setIsRefreshing(false)
    }
  }, [code, activeFilter, isRefreshing])

  // Pull-to-refresh hook with professional error handling
  const { containerRef, disablePullToRefresh, enablePullToRefresh, pullState, pullDistance } = usePullToRefresh(
    performRefresh,
    isRefreshing
  )

  // Container CSS injection (Stable, no dependencies)
  useEffect(() => {
    const scrollContainerCSS = `
      html, body {
        height: 100%;
        overflow: hidden;
        margin: 0;
        padding: 0;
      }
      
      .gallery-scroll-container {
        height: 100vh;
        height: 100dvh;
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior-y: contain;
        -webkit-overflow-scrolling: touch;
      }
      
      @media screen and (max-width: 768px) {
        body {
          -webkit-tap-highlight-color: transparent;
        }
      }
    `
    
    const styleElement = document.createElement('style')
    styleElement.id = 'gallery-scroll-container'
    styleElement.textContent = scrollContainerCSS
    document.head.appendChild(styleElement)
    
    return () => {
      const existingStyle = document.getElementById('gallery-scroll-container')
      if (existingStyle) {
        existingStyle.remove()
      }
      
      document.documentElement.style.height = ''
      document.documentElement.style.overflow = ''
      document.body.style.height = ''
      document.body.style.overflow = ''
    }
  }, [])

  // Initial data loading
  useEffect(() => {
    const loadGallery = async () => {
      if (!code) {
        setError('Invalid gallery URL')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await apiService.getGallery(code, activeFilter)
        
        setPhotos(data.photos)
        setUserName(data.user.name)
        setTotalPhotos(data.user.totalPhotos)
        setRetentionDays(data.retentionDays)
        setEvent(data.event || null)
        setError(null)

        if (activeFilter === 'all') {
          trackGalleryOpen({
            filter: activeFilter,
            photo_count: data.photos.length,
            user_name: data.user.name,
            retention_days: data.retentionDays
          })
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load gallery'
        setError(errorMessage)
        console.error('Gallery load error:', err)
        
        if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          setError('Access denied. Your gallery link may have expired or is invalid.')
        } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
          setError('Gallery not found. Please check your link.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadGallery()
  }, [code, activeFilter, trackGalleryOpen])

  // Memoized filtered photos
  const filteredPhotos = useMemo(() => {
    switch (activeFilter) {
      case 'enhanced':
        return photos.filter(photo => photo.isEnhanced)
      case 'favorites':
        return photos.filter(photo => photo.isFavorite)
      case 'all':
      default:
        return photos
    }
  }, [photos, activeFilter])

  // Event handlers
  const handleFilterChange = useCallback((filter: GalleryFilter) => {
    setActiveFilter(filter)
    trackGallerySearch(filter, {
      previous_filter: activeFilter,
      total_photos: photos.length
    })
  }, [activeFilter, photos.length, trackGallerySearch])

  const handlePhotoClick = useCallback((photoIndex: number) => {
    setCurrentPhotoIndex(photoIndex)
    setViewerOpen(true)
    disablePullToRefresh() // Professional: Prevent interference
  }, [disablePullToRefresh])

  const handleViewerClose = useCallback(() => {
    setViewerOpen(false)
    enablePullToRefresh() // Professional: Re-enable after viewer closes
  }, [enablePullToRefresh])

  const handlePhotoChange = useCallback((newIndex: number) => {
    setCurrentPhotoIndex(newIndex)
  }, [])

  const handleSinglePhotoShare = useCallback(async (photo: GalleryPhoto) => {
    try {
      setError(null)
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Snappin Photo',
          text: `Check out this photo from Snappin!`,
          url: photo.downloadUrl,
        })
      } else {
        await navigator.clipboard.writeText(photo.downloadUrl)
        setSuccessMessage('Photo link copied to clipboard!')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Share failed')
    }
  }, [])

  const handleSinglePhotoDownload = useCallback(async (photo: GalleryPhoto) => {
    try {
      setError(null)
      
      const link = document.createElement('a')
      link.href = photo.downloadUrl
      link.download = photo.originalFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setSuccessMessage('Photo downloaded successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    }
  }, [])

  const handleSinglePhotoDelete = useCallback(async (photo: GalleryPhoto) => {
    if (!code) return

    try {
      setError(null)
      
      // Call the gallery-specific delete API
      await apiService.deleteGalleryPhoto(code, photo.id)
      
      // Remove the photo from the current photos array
      setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photo.id))
      
      // Update total count
      setTotalPhotos(prev => Math.max(0, prev - 1))
      
      setSuccessMessage('Photo removed from your gallery')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo')
    }
  }, [code])

  const handleGalleryShare = useCallback(async () => {
    try {
      setError(null)
      
      const galleryUrl = window.location.href
      const galleryTitle = event?.name ? `${event.name} Photos` : 'Photo Gallery'
      
      if (navigator.share) {
        await navigator.share({
          title: galleryTitle,
          text: `Check out these photos from ${galleryTitle}!`,
          url: galleryUrl,
        })
      } else {
        await navigator.clipboard.writeText(galleryUrl)
        setSuccessMessage('Gallery link copied to clipboard!')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Share failed')
    }
  }, [event])

  return (
      <ThemeProvider theme={theme}>
      <Box
        ref={containerRef}
        className="gallery-scroll-container"
        sx={{
          backgroundColor: '#f5f5f5',
        }}
      >
        
        {/* Pull-to-Refresh Indicator */}
        {pullState !== 'idle' && (
          <Box
            sx={{
              position: 'absolute',
              top: Math.max(0, pullDistance - 20),
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1,
              opacity: Math.min(pullDistance / 60, 1),
              transition: 'none',
            }}
          >
            <CircularProgress 
              size={35} 
              thickness={3}
              sx={{
                color: '#1976d2',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                }
              }}
              variant={pullState === 'refreshing' ? 'indeterminate' : 'determinate'}
              value={pullState === 'ready' ? 100 : Math.min((pullDistance / 80) * 100, 100)}
            />
          </Box>
        )}
        
        {/* Conditional Content Rendering */}
        {loading ? (
        <Box
          sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          zIndex: 9999,
          }}
        >
        <CircularProgress 
          size={120} 
          thickness={4}
          color="primary"
        />
        </Box>
        ) : error ? (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
        ) : (
          <>
            {/* Center Loading for Pull-to-Refresh */}
            {isRefreshing && pullState === 'idle' && (
      <Box
        sx={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: theme.zIndex.modal,
        }}
      >
                <CircularProgress 
                  size={100} 
                  thickness={4}
                  color="primary"
                />
              </Box>
            )}

        <Container 
          maxWidth="lg" 
          sx={{ 
            py: { xs: 1, sm: 1.5 }, // Reduced from 3 to 1/1.5
            px: { xs: 1, sm: 2 }, // Reduced horizontal padding
          }}
        >
          <UserGreeting 
            userName={userName}
            photoCount={filteredPhotos.length}
            event={event}
          />
          
          <FilterTabs 
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
          
          <PhotoGrid
            photos={filteredPhotos}
            onPhotoClick={handlePhotoClick}
          />
        </Container>
          </>
        )}

        {/* Success/Error Snackbars */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </Box>

      <PhotoViewer
        photos={filteredPhotos}
        currentIndex={currentPhotoIndex}
        isOpen={viewerOpen}
        onClose={handleViewerClose}
        onShare={handleSinglePhotoShare}
        onDownload={handleSinglePhotoDownload}
        onDelete={handleSinglePhotoDelete}
        onPhotoChange={handlePhotoChange}
      />

      {/* Floating Share Button */}
      <Tooltip title="Share Gallery" placement="left">
        <Fab
          onClick={handleGalleryShare}
          sx={{
            position: 'fixed',
            bottom: { xs: 24, sm: 32 },
            right: { xs: 16, sm: 24 },
            backgroundColor: '#1877f2', // Facebook/Instagram blue
            color: 'white',
            width: { xs: 56, sm: 64 },
            height: { xs: 56, sm: 64 },
            boxShadow: '0 4px 20px rgba(24, 119, 242, 0.4)',
            zIndex: 1000,
            '&:hover': {
              backgroundColor: '#166fe5',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 24px rgba(24, 119, 242, 0.5)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Share fontSize={isMobile ? 'medium' : 'large'} />
        </Fab>
      </Tooltip>
    </ThemeProvider>
  )
} 