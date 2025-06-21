import { memo, useState, useCallback } from 'react'
import { Box, Typography, Card, CardMedia, Skeleton, useTheme, useMediaQuery } from '@mui/material'
import { GalleryEvent } from '@/types'

interface UserGreetingProps {
  userName: string
  photoCount: number
  event?: GalleryEvent | null
}

export const UserGreeting = memo(({ userName, photoCount, event }: UserGreetingProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [bannerLoaded, setBannerLoaded] = useState(false)
  const [bannerError, setBannerError] = useState(false)

  const handleBannerLoad = useCallback(() => {
    setBannerLoaded(true)
  }, [])

  const handleBannerError = useCallback(() => {
    setBannerError(true)
    setBannerLoaded(true)
  }, [])

  // Format date for display
  const formatEventDate = useCallback((dateString?: string) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return null
    }
  }, [])

  // If no event or no banner, show simplified version
  if (!event || !event.banner) {
  return (
    <Box sx={{ mb: 2.5 }}>
        {event && (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              color: 'text.primary',
              mb: 1,
            }}
          >
            {event.name}
          </Typography>
        )}
        
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
          color: 'text.primary',
          mb: 0.25,
        }}
      >
        Photos
      </Typography>
      
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        {photoCount} items
      </Typography>
      </Box>
    )
  }

  // Hero banner version with event - Ultra Compact Design
  return (
    <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
      {/* 16:9 Hero Banner */}
      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: { xs: 1, sm: 1.5 },
          aspectRatio: '16 / 9', // Restored 16:9 ratio
          mb: { xs: 1, sm: 1.5 },
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: 'none',
        }}
        elevation={0}
      >
        {/* Banner Image - No overlay */}
        {!bannerError && (
          <>
            {!bannerLoaded && (
              <Skeleton
                variant="rectangular"
                width="100%"
                height="100%"
                animation="wave"
                sx={{
                  backgroundColor: '#e9ecef',
                }}
              />
            )}
            
            <CardMedia
              component="img"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'opacity 0.3s ease-out',
                opacity: bannerLoaded ? 1 : 0,
              }}
              src={event.banner.url}
              alt={`${event.name} banner`}
              onLoad={handleBannerLoad}
              onError={handleBannerError}
              loading="lazy"
            />
          </>
        )}

        {/* Banner Error State */}
        {bannerError && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Typography variant="h1" sx={{ fontSize: '4rem', mb: 1, opacity: 0.8 }}>
              🖼️
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem', opacity: 0.9 }}>
              Banner unavailable
            </Typography>
          </Box>
        )}
      </Card>

      {/* Event Information with Harmonious Spacing */}
      <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            color: 'text.primary',
            mb: { xs: 0.5, sm: 0.75 }, // Increased for better separation
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          {event.name}
        </Typography>

        {/* Event Details with Better Spacing */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.75, sm: 1 }, mb: { xs: 1, sm: 1.25 } }}>
          {formatEventDate(event.start_time) && (
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              📅 {formatEventDate(event.start_time)}
            </Typography>
          )}
          
          {event.location && (
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              📍 {event.location}
            </Typography>
          )}
        </Box>

        {/* Photo Count - Clean Without Separator */}
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            mt: { xs: 0.25, sm: 0.5 }, // Small margin for subtle separation
          }}
        >
          {photoCount} Photos
        </Typography>
      </Box>
    </Box>
  )
})

UserGreeting.displayName = 'UserGreeting' 