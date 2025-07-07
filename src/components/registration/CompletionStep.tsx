import { Box, Typography, Button, Paper, Chip } from '@mui/material'
import { CheckCircle, Email, AccessTime, PhoneAndroid } from '@mui/icons-material'
import { StepProps } from '@/types/registration'
import promPhoto from '@/assets/prom_photo.png'

export const CompletionStep = ({ formData }: StepProps) => {
  const handleClose = () => {
    // Close the registration modal or redirect
    window.close()
  }

  const handleReturnToEvent = () => {
    // Navigate back to event or close
    window.history.back()
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: 360, sm: 400, md: 440 }, mx: 'auto', px: { xs: 1, sm: 2 } }}>
      {/* Success Icon */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
        <CheckCircle
          sx={{
            fontSize: { xs: 100, sm: 120, md: 140 },
            color: '#4caf50',
            mb: { xs: 1.5, sm: 2 },
          }}
        />
      </Box>

      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          mb: { xs: 1.5, sm: 2, md: 2.5 },
          textAlign: 'left',
          color: '#1d1d1f',
          fontSize: '1.75rem',
        }}
      >
        You're all set!
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: { xs: 2.5, sm: 3, md: 4 },
          textAlign: 'left',
          color: '#6e6e73',
          lineHeight: 1.6,
          fontSize: '1rem',
        }}
      >
Smile big. We'll take it from here.      </Typography>

      {/* Email Info */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          borderRadius: 2,
          backgroundColor: '#f8f9fa',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
          <Email sx={{ color: '#1976d2', mr: 1, fontSize: { xs: 20, sm: 24 } }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Your gallery will be sent to:
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: '#1976d2',
            wordBreak: 'break-word',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            mb: { xs: 1.5, sm: 2 },
          }}
        >
          {formData.email}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTime sx={{ color: '#ff9800', fontSize: { xs: 18, sm: 20 } }} />
          <Typography variant="body2" sx={{ color: '#6e6e73', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Your gallery expands each time we spot you in a photo
          </Typography>
        </Box>
      </Paper>

      {/* Illustration */}
      {promPhoto && (
        <Paper
          elevation={1}
          sx={{
            mb: { xs: 2, sm: 3 },
            borderRadius: 2,
            backgroundColor: '#f8f9fa',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={promPhoto}
            alt="People taking photos at an event"
            sx={{
              width: '100%',
              height: { xs: 180, sm: 200 },
              objectFit: 'cover',
              objectPosition: 'center 20%', // 显示图片上半部分
              display: 'block',
            }}
          />
        </Paper>
      )}

      {/* Timeline Info */}
      {/* <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 }, gap: 1 }}>
          <AccessTime sx={{ color: '#ff9800', fontSize: { xs: 18, sm: 20 } }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Expected time:
          </Typography>
          <Chip
            label="5-10 minutes"
            size="small"
            sx={{
              backgroundColor: '#fff3e0',
              color: '#f57c00',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          After the event ends
        </Typography>
      </Box> */}

      {/* Brand Logo Section */}
      <Box sx={{ textAlign: 'center', mt: { xs: 3, sm: 4 }, pt: { xs: 2, sm: 3 }, borderTop: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
            }}
          >
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
              S
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            {import.meta.env.VITE_APP_NAME || 'SNAPPIN'}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.8rem',
            mt: 0.5,
          }}
        >
          Powered by Snappin
        </Typography>
      </Box>

      {/* Important Notice
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
          <PhoneAndroid sx={{ color: '#9c27b0', fontSize: { xs: 18, sm: 20 } }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Important:
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          📱 Check your spam folder too!
        </Typography>
      </Box> */}
    </Box>
  )
} 