import { useState, useCallback, useEffect, useRef } from 'react'
import { 
  Box, 
  IconButton, 
  Fade, 
  useTheme, 
  useMediaQuery, 
  Slide, 
  Tooltip, 
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material'
import { 
  Close, 
  Share, 
  Download, 
  ArrowBackIos, 
  ArrowForwardIos, 
  Favorite,
  FavoriteBorder,
  TrendingUp,
  DeleteOutline
} from '@mui/icons-material'
import { GalleryPhoto } from '@/types'
import { useGalleryTracking } from '@/hooks/useGalleryTracking'

interface PhotoViewerProps {
  photos: GalleryPhoto[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onShare: (photo: GalleryPhoto) => void
  onDownload: (photo: GalleryPhoto) => void
  onDelete?: (photo: GalleryPhoto) => Promise<void>
  onPhotoChange?: (newIndex: number) => void
}

export const PhotoViewer = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onShare,
  onDownload,
  onDelete,
  onPhotoChange
}: PhotoViewerProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(currentIndex)
  const [showControls, setShowControls] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showFirstTimeHint, setShowFirstTimeHint] = useState(false)
  const [shareButtonGlow, setShareButtonGlow] = useState(false)
  const [hasUsedShare, setHasUsedShare] = useState(false)
  const [hasUsedDownload, setHasUsedDownload] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // Refs for the three container approach
  const containerRef = useRef<HTMLDivElement>(null)
  const leftContainerRef = useRef<HTMLDivElement>(null)
  const centerContainerRef = useRef<HTMLDivElement>(null)
  const rightContainerRef = useRef<HTMLDivElement>(null)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Current photos being displayed (triple buffer)
  const photosBuffer = useRef({
    left: null as GalleryPhoto | null,
    center: null as GalleryPhoto | null,
    right: null as GalleryPhoto | null
  })
  
  // Touch state
  const touchRef = useRef({
    isDown: false,
    startX: 0,
    currentX: 0,
    startTime: 0,
    isDragging: false,
    initialTransform: 0
  })
  
  const { trackPhotoView, trackPhotoShare, trackPhotoDownload } = useGalleryTracking()

  const currentPhoto = photos[currentPhotoIndex]

  // Auto memory management for mobile devices
  useEffect(() => {
    if (!isOpen) return

    const checkMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit
        
        if (usageRatio > 0.7) {
          // Clear unused image sources to free memory
          [leftContainerRef, centerContainerRef, rightContainerRef].forEach(ref => {
            const img = ref.current?.querySelector('img')
            if (img && img.style.display === 'none') {
              img.src = ''
            }
          })
        }
      }
    }

    // Check memory every 30 seconds
    const memoryCheckInterval = setInterval(checkMemoryUsage, 30000)
    
    return () => clearInterval(memoryCheckInterval)
  }, [isOpen])

  // Update photo buffer - the key to avoiding flicker
  const updatePhotoBuffer = useCallback((centerIndex: number) => {
    photosBuffer.current = {
      left: centerIndex > 0 ? photos[centerIndex - 1] : null,
      center: photos[centerIndex] || null,
      right: centerIndex < photos.length - 1 ? photos[centerIndex + 1] : null
    }
  }, [photos])

  // Professional image preloader to prevent flicker
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject()
      img.src = src
    })
  }, [])

  // Apply photos to containers with anti-flicker techniques
  const applyPhotosToContainers = useCallback(async () => {
    const { left, center, right } = photosBuffer.current

    // Preload all images first to prevent flicker
    const preloadPromises: Promise<void>[] = []
    if (left) preloadPromises.push(preloadImage(left.downloadUrl || left.thumbnailUrl))
    if (center) preloadPromises.push(preloadImage(center.downloadUrl || center.thumbnailUrl))
    if (right) preloadPromises.push(preloadImage(right.downloadUrl || right.thumbnailUrl))

    try {
      // Wait for all images to load
      await Promise.all(preloadPromises)
    } catch (error) {
      // Continue anyway if some images fail to preload
    }
    
    // Update left container with fade transition
    if (leftContainerRef.current) {
      const img = leftContainerRef.current.querySelector('img')
      if (img) {
        if (left) {
          const oldSrc = img.src
          const newSrc = left.downloadUrl || left.thumbnailUrl
          
          // Only update if source actually changed
          if (oldSrc !== newSrc) {
            img.style.opacity = '0'
            img.src = newSrc
            img.alt = left.originalFilename
            img.style.display = 'block'
            
            // Fade in after image loads
            requestAnimationFrame(() => {
              img.style.opacity = '1'
            })
          } else {
            img.style.display = 'block'
            img.style.opacity = '1'
          }
        } else {
          img.style.opacity = '0'
          setTimeout(() => {
            img.style.display = 'none'
          }, 50)
        }
      }
    }
    
    // Update center container with fade transition
    if (centerContainerRef.current) {
      const img = centerContainerRef.current.querySelector('img')
      if (img) {
        if (center) {
          const oldSrc = img.src
          const newSrc = center.downloadUrl || center.thumbnailUrl
          
          // Only update if source actually changed
          if (oldSrc !== newSrc) {
            img.style.opacity = '0'
            img.src = newSrc
            img.alt = center.originalFilename
            img.style.display = 'block'
            
            // Fade in after image loads
            requestAnimationFrame(() => {
              img.style.opacity = '1'
            })
          } else {
            img.style.display = 'block'
            img.style.opacity = '1'
          }
        } else {
          img.style.opacity = '0'
          setTimeout(() => {
            img.style.display = 'none'
          }, 50)
        }
      }
    }
    
    // Update right container with fade transition
    if (rightContainerRef.current) {
      const img = rightContainerRef.current.querySelector('img')
      if (img) {
        if (right) {
          const oldSrc = img.src
          const newSrc = right.downloadUrl || right.thumbnailUrl
          
          // Only update if source actually changed
          if (oldSrc !== newSrc) {
            img.style.opacity = '0'
            img.src = newSrc
            img.alt = right.originalFilename
            img.style.display = 'block'
            
            // Fade in after image loads
            requestAnimationFrame(() => {
              img.style.opacity = '1'
            })
          } else {
            img.style.display = 'block'
            img.style.opacity = '1'
          }
        } else {
          img.style.opacity = '0'
          setTimeout(() => {
            img.style.display = 'none'
          }, 50)
        }
      }
    }
  }, [currentPhotoIndex, preloadImage])

  // CSS-only transform without state changes
  const setTransform = useCallback((translateX: number, transition = false) => {
    if (!containerRef.current) return
    
    const style = containerRef.current.style
    style.transition = transition ? 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
    style.transform = `translate3d(${translateX}px, 0, 0)`
  }, [])

  // Navigation with double buffering
  const navigateToPhoto = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= photos.length || newIndex === currentPhotoIndex || isTransitioning) {
      return
    }

    setIsTransitioning(true)
    
    const direction = newIndex > currentPhotoIndex ? 1 : -1
    const targetTransform = -window.innerWidth + (-direction * window.innerWidth)
    
    // Start CSS animation
    setTransform(targetTransform, true)
    
    setTimeout(async () => {
      // Update buffer with new photos IMMEDIATELY (no flicker)
      updatePhotoBuffer(newIndex)
      
      // Apply new photos to DOM with preloading
      await applyPhotosToContainers()
      
      // Reset to center position instantly
      setTransform(-window.innerWidth, false)
      
      // Update React state (last, to avoid re-renders during animation)
      setCurrentPhotoIndex(newIndex)
      setIsTransitioning(false)
      
      // Notify parent component of the change
      onPhotoChange?.(newIndex)
    }, 300)
  }, [currentPhotoIndex, photos.length, isTransitioning, setTransform, updatePhotoBuffer, applyPhotosToContainers, onPhotoChange])

  // Simple navigation handlers
  const handlePrevious = useCallback(() => {
    if (currentPhotoIndex > 0) {
      navigateToPhoto(currentPhotoIndex - 1)
    }
  }, [currentPhotoIndex, navigateToPhoto])

  const handleNext = useCallback(() => {
    if (currentPhotoIndex < photos.length - 1) {
      navigateToPhoto(currentPhotoIndex + 1)
    }
  }, [currentPhotoIndex, photos.length, navigateToPhoto])

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    setShowControls(true)
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
      setShowFirstTimeHint(false)
    }, 4000)
  }, [])

  // Initialize - only runs when opening/closing, not when currentIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentPhotoIndex(currentIndex)
      setIsTransitioning(false)
      resetControlsTimer()
      
      // Initialize photo buffer and apply to containers
      updatePhotoBuffer(currentIndex)
      
      // Apply photos after DOM is ready
      requestAnimationFrame(async () => {
        await applyPhotosToContainers()
        // Reset to center position showing current photo
        setTransform(-window.innerWidth, false)
      })
    }
  }, [isOpen, updatePhotoBuffer, applyPhotosToContainers, setTransform, resetControlsTimer, currentIndex])

  // Enhanced cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
      
      // Clear photo buffer to prevent memory leaks
      photosBuffer.current = {
        left: null,
        center: null,
        right: null
      }
      
      // Reset container transform and transitions
      if (containerRef.current) {
        containerRef.current.style.transform = ''
        containerRef.current.style.transition = ''
      }
      
      // Clear image sources to free memory
      [leftContainerRef, centerContainerRef, rightContainerRef].forEach(ref => {
        const img = ref.current?.querySelector('img')
        if (img) {
          img.src = ''
          img.style.opacity = '0'
          img.style.display = 'none'
        }
      })
    }
  }, [])

  // Track photo view with deduplication
  useEffect(() => {
    if (isOpen && currentPhoto) {
      const photoViewKey = 'photo_view_timestamps'
      const now = Date.now()
      const oneMinute = 60 * 1000
      
      try {
        const timestampsData = localStorage.getItem(photoViewKey)
        const timestamps = timestampsData ? JSON.parse(timestampsData) : {}
        
        const lastViewTime = timestamps[currentPhoto.id]
        const shouldTrack = !lastViewTime || (now - lastViewTime) >= oneMinute
        
        if (shouldTrack) {
          timestamps[currentPhoto.id] = now
          localStorage.setItem(photoViewKey, JSON.stringify(timestamps))
          
          trackPhotoView(currentPhoto.id, {
            source: 'photo_viewer',
            photo_filename: currentPhoto.originalFilename,
            photo_index: currentPhotoIndex,
            total_photos: photos.length,
            opened_at: now
          })
        }
      } catch (error) {
        trackPhotoView(currentPhoto.id, {
          source: 'photo_viewer',
          photo_filename: currentPhoto.originalFilename,
          photo_index: currentPhotoIndex,
          total_photos: photos.length,
          opened_at: now,
          dedup_fallback: true
        })
      }
    }
  }, [isOpen, currentPhoto, currentPhotoIndex, photos.length, trackPhotoView])

  // First-time hints
  useEffect(() => {
    if (isOpen) {
      const hasShared = localStorage.getItem('photoViewer_has_shared')
      const hasDownloaded = localStorage.getItem('photoViewer_has_downloaded')
      
      setHasUsedShare(!!hasShared)
      setHasUsedDownload(!!hasDownloaded)
      
      if (!hasShared && !hasDownloaded) {
        hintTimeoutRef.current = setTimeout(() => {
          setShowFirstTimeHint(true)
          setShareButtonGlow(true)
          setTimeout(() => setShareButtonGlow(false), 3000)
    }, 3000)
      }
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || isTransitioning) return

    const handleKeyPress = (e: KeyboardEvent) => {
      resetControlsTimer()
      
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, isTransitioning, handlePrevious, handleNext, onClose, resetControlsTimer])

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isTransitioning) return

    const touch = e.touches[0]
    touchRef.current = {
      isDown: true,
      startX: touch.clientX,
      currentX: touch.clientX,
      startTime: Date.now(),
      isDragging: false,
      initialTransform: 0
    }
    
    resetControlsTimer()
  }, [isTransitioning, resetControlsTimer])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = touchRef.current
    if (!touch.isDown || isTransitioning) return

    const clientX = e.touches[0].clientX
    const deltaX = clientX - touch.startX
    
    if (!touch.isDragging && Math.abs(deltaX) > 10) {
      touch.isDragging = true
    }

    if (touch.isDragging) {
      e.preventDefault()
      touch.currentX = clientX
      
      let adjustedDelta = deltaX
      if ((currentPhotoIndex === 0 && deltaX > 0) || 
          (currentPhotoIndex === photos.length - 1 && deltaX < 0)) {
        adjustedDelta = deltaX * 0.3
      }
      
      // Apply delta from center position (-100vw)
      setTransform(-window.innerWidth + adjustedDelta, false)
    }
  }, [isTransitioning, currentPhotoIndex, photos.length, setTransform])

  const handleTouchEnd = useCallback(() => {
    const touch = touchRef.current
    if (!touch.isDown || !touch.isDragging || isTransitioning) {
      touchRef.current.isDown = false
      touchRef.current.isDragging = false
      return
    }

    const deltaX = touch.currentX - touch.startX
    const deltaTime = Date.now() - touch.startTime
    const velocity = Math.abs(deltaX) / deltaTime

    if (Math.abs(deltaX) > 60 || velocity > 0.2) {
      if (deltaX > 0 && currentPhotoIndex > 0) {
        navigateToPhoto(currentPhotoIndex - 1)
      } else if (deltaX < 0 && currentPhotoIndex < photos.length - 1) {
        navigateToPhoto(currentPhotoIndex + 1)
      } else {
        setTransform(-window.innerWidth, true)
    }
    } else {
      setTransform(-window.innerWidth, true)
    }

    touchRef.current.isDown = false
    touchRef.current.isDragging = false
  }, [isTransitioning, currentPhotoIndex, photos.length, navigateToPhoto, setTransform])

  // Click handlers
  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if (isMobile || isTransitioning) {
      resetControlsTimer()
      return
    }
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const imageWidth = rect.width
    
    if (clickX < imageWidth / 3 && currentPhotoIndex > 0) {
      handlePrevious()
    } else if (clickX > (imageWidth * 2) / 3 && currentPhotoIndex < photos.length - 1) {
      handleNext()
    } else {
      resetControlsTimer()
    }
  }, [isMobile, isTransitioning, currentPhotoIndex, photos.length, handlePrevious, handleNext, resetControlsTimer])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isTransitioning) {
      onClose()
    }
  }, [onClose, isTransitioning])

  // Action handlers
  const handleShare = useCallback(() => {
    if (currentPhoto) {
      trackPhotoShare(currentPhoto.id, {
        source: 'photo_viewer',
        photo_filename: currentPhoto.originalFilename,
        photo_index: currentPhotoIndex,
        total_photos: photos.length
      })
      
      onShare(currentPhoto)
      
      if (!hasUsedShare) {
        localStorage.setItem('photoViewer_has_shared', 'true')
        setHasUsedShare(true)
        setShowFirstTimeHint(false)
      }
    }
  }, [currentPhoto, onShare, trackPhotoShare, currentPhotoIndex, photos.length, hasUsedShare])

  const handleDownload = useCallback(() => {
    if (currentPhoto) {
      trackPhotoDownload(currentPhoto.id, {
        source: 'photo_viewer',
        photo_filename: currentPhoto.originalFilename,
        photo_index: currentPhotoIndex,
        total_photos: photos.length
      })
      
      onDownload(currentPhoto)
      
      if (!hasUsedDownload) {
        localStorage.setItem('photoViewer_has_downloaded', 'true')
        setHasUsedDownload(true)
    }
    }
  }, [currentPhoto, onDownload, trackPhotoDownload, currentPhotoIndex, photos.length, hasUsedDownload])

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(prev => !prev)
  }, [])

  // Delete handlers
  const handleDeleteClick = useCallback(() => {
    console.log('Delete button clicked!') // Debug log
    setShowDeleteDialog(true)
    resetControlsTimer()
  }, [resetControlsTimer])

  const handleDeleteConfirm = useCallback(async () => {
    if (!currentPhoto || !onDelete || isDeleting) return

    setIsDeleting(true)
    try {
      await onDelete(currentPhoto)
      
      // After successful deletion, handle navigation
      const remainingPhotos = photos.filter(p => p.id !== currentPhoto.id)
      
      if (remainingPhotos.length === 0) {
        // No photos left, close the viewer
        onClose()
      } else if (currentPhotoIndex >= remainingPhotos.length) {
        // We were at the last photo, go to the new last photo
        const newIndex = remainingPhotos.length - 1
        navigateToPhoto(newIndex)
      } else {
        // Stay at current index or navigate to next photo
        // The parent component should handle updating the photos array
        // We just reset to current position
        navigateToPhoto(currentPhotoIndex)
      }
      
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Failed to delete photo:', error)
      // Error is handled by the parent component
    } finally {
      setIsDeleting(false)
    }
  }, [currentPhoto, onDelete, isDeleting, photos, currentPhotoIndex, onClose, navigateToPhoto])

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteDialog(false)
    resetControlsTimer()
  }, [resetControlsTimer])

  // Render single photo container with anti-flicker CSS
  const renderPhotoContainer = useCallback((containerRef: React.RefObject<HTMLDivElement>, position: 'left' | 'center' | 'right') => {
    return (
      <div
        ref={containerRef}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <img
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none',
            display: 'none', // Initially hidden, will be shown by applyPhotosToContainers
            opacity: '0',
            transition: 'opacity 150ms ease-out', // Smooth fade transition
            willChange: 'opacity', // Optimize for opacity changes
          }}
          draggable={false}
          alt=""
        />
      </div>
    )
  }, [])

  if (!isOpen || !currentPhoto) return null

  return (
    <Fade in={isOpen} timeout={200}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 1)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={handleBackdropClick}
      >
        {/* First-time Hint */}
        {showFirstTimeHint && !hasUsedShare && !hasUsedDownload && (
          <Fade in={showFirstTimeHint} timeout={500}>
            <Chip
              icon={<TrendingUp />}
              label="Share & download below"
              sx={{
                position: 'absolute',
                bottom: isMobile ? 120 : 140,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(25, 118, 210, 0.9)',
                color: 'white',
                fontSize: '0.75rem',
                height: 32,
                zIndex: 10002,
                animation: 'fadeInOut 3s ease-in-out',
                '@keyframes fadeInOut': {
                  '0%': { opacity: 0 },
                  '20%': { opacity: 1 },
                  '80%': { opacity: 1 },
                  '100%': { opacity: 0 },
                },
                '& .MuiChip-icon': { color: 'white', fontSize: 16 }
              }}
            />
          </Fade>
        )}

        {/* Top Bar */}
        <Slide direction="down" in={showControls} timeout={200}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: { xs: 50, md: 60 },
              background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              pt: { xs: 0.5, md: 1 },
              px: { xs: 1, md: 2 },
              zIndex: 10001,
            }}
          >
              <IconButton
                onClick={onClose}
                sx={{
                  color: 'white',
                  width: 44,
                  height: 44,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
              <Close />
              </IconButton>

            {photos.length > 1 && (
              <Box
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backdropFilter: 'blur(10px)',
                  mt: 0.5,
                }}
              >
                {currentPhotoIndex + 1} of {photos.length}
              </Box>
            )}

            {/* Delete Button - Following iOS/Google Photos pattern */}
            {onDelete && (
              <Tooltip title="Delete this photo" placement="left">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                    handleDeleteClick()
                }}
                  disabled={isDeleting}
                sx={{
                    color: 'rgba(244, 67, 54, 0.7)',
                    width: 40,
                    height: 40,
                    zIndex: 10002, // Higher than other controls to ensure clickability
                  '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      color: 'rgba(244, 67, 54, 1)',
                    transform: 'scale(1.05)',
                  },
                    '&:disabled': {
                      color: 'rgba(244, 67, 54, 0.3)',
                    },
                    transition: 'all 0.2s ease',
                }}
              >
                  <DeleteOutline fontSize="small" />
              </IconButton>
            </Tooltip>
            )}
            
            {!onDelete && <Box sx={{ width: 44 }} />}
          </Box>
        </Slide>

        {/* Navigation Arrows - Desktop */}
        {photos.length > 1 && !isMobile && showControls && !isTransitioning && (
          <>
            {currentPhotoIndex > 0 && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePrevious()
                      }}
                      sx={{
                  position: 'absolute',
                  left: 20,
                        color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  width: 48,
                  height: 48,
                  zIndex: 10001,
                        '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    transform: 'scale(1.05)',
                        },
                  transition: 'all 0.2s ease',
                      }}
                    >
                      <ArrowBackIos />
                    </IconButton>
            )}

            {currentPhotoIndex < photos.length - 1 && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNext()
                      }}
                      sx={{
                  position: 'absolute',
                  right: 20,
                        color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  width: 48,
                  height: 48,
                  zIndex: 10001,
                        '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    transform: 'scale(1.05)',
                        },
                  transition: 'all 0.2s ease',
                      }}
                    >
                      <ArrowForwardIos />
                    </IconButton>
            )}
          </>
        )}

        {/* Triple Buffer Photo Container */}
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            ref={containerRef}
            style={{
              width: '300vw',
              height: '100vh',
                    display: 'flex',
                    position: 'absolute',
                    top: 0,
              left: 0,
              transform: 'translate3d(-100vw, 0, 0)', // Start with center container visible
              willChange: 'transform',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleImageClick}
          >
            {renderPhotoContainer(leftContainerRef, 'left')}
            {renderPhotoContainer(centerContainerRef, 'center')}
            {renderPhotoContainer(rightContainerRef, 'right')}
          </div>
        </Box>

        {/* Bottom Action Bar */}
        <Slide direction="up" in={showControls} timeout={200}>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
              height: { xs: 80, md: 90 },
              background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              gap: { xs: 2, md: 3 },
              pb: { xs: 1, md: 2 },
                zIndex: 10001,
              }}
            >
            <Tooltip title="Share this photo" placement="top">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare()
                  }}
                  sx={{
                    color: 'white',
                  backgroundColor: shareButtonGlow || !hasUsedShare 
                    ? 'rgba(25, 118, 210, 0.8)'
                    : 'rgba(255, 255, 255, 0.1)',
                  width: { xs: 52, md: 56 },
                  height: { xs: 52, md: 56 },
                  transition: 'all 0.3s ease',
                    '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 1)',
                      transform: 'scale(1.05)',
                    },
                  ...(!hasUsedShare && {
                    boxShadow: '0 0 15px rgba(25, 118, 210, 0.6)',
                  }),
                  }}
                >
                <Share />
                </IconButton>
              </Tooltip>

                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleFavorite()
                  }}
                  sx={{
                    color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  width: { xs: 52, md: 56 },
                  height: { xs: 52, md: 56 },
                    '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.05)',
                    },
                  transition: 'all 0.3s ease',
                  }}
                >
                {isFavorite ? <Favorite sx={{ color: '#ff4081' }} /> : <FavoriteBorder />}
                </IconButton>

              <Tooltip title="Download this photo" placement="top">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload()
                  }}
                  sx={{
                    color: 'white',
                  backgroundColor: !hasUsedDownload 
                    ? 'rgba(76, 175, 80, 0.8)'
                    : 'rgba(255, 255, 255, 0.1)',
                  width: { xs: 52, md: 56 },
                  height: { xs: 52, md: 56 },
                  transition: 'all 0.3s ease',
                    '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 1)',
                      transform: 'scale(1.05)',
                    },
                  ...(!hasUsedDownload && {
                    filter: 'saturate(1.2)',
                  }),
                  }}
                >
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          </Slide>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={showDeleteDialog}
          onClose={handleDeleteCancel}
          sx={{ zIndex: 10003 }}
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              color: 'white',
              minWidth: { xs: 280, sm: 320 },
              maxWidth: 400,
              zIndex: 10003,
            },
          }}
          BackdropProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            },
          }}
        >
          <DialogContent sx={{ pt: 4, pb: 2, px: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 500 }}>
              Delete this photo?
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem'
              }}
            >
              This action cannot be undone
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3, gap: 1.5, justifyContent: 'center' }}>
            <Button
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              variant="contained"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'black',
                fontWeight: 600,
                minWidth: 100,
                '&:hover': {
                  backgroundColor: 'white',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              variant="text"
              sx={{
                color: '#ff4444',
                fontWeight: 500,
                minWidth: 100,
                '&:hover': {
                  backgroundColor: 'rgba(255, 68, 68, 0.1)',
                },
                '&:disabled': {
                  color: 'rgba(255, 68, 68, 0.3)',
                },
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  )
}