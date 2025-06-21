import { Box, Typography, Button, Paper, Chip } from '@mui/material'
import { CheckCircle, Email, AccessTime, PhoneAndroid } from '@mui/icons-material'
import { StepProps } from '@/types/registration'

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
          color: 'text.primary',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
        }}
      >
        Registration Complete!
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: { xs: 2.5, sm: 3, md: 4 },
          textAlign: 'left',
          color: 'text.secondary',
          lineHeight: 1.6,
          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
        }}
      >
       You're all set! We'll email you when your photos are ready.
      </Typography>

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
            Watch for emails at:
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: '#1976d2',
            wordBreak: 'break-word',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
          }}
        >
          {formData.email}
        </Typography>
      </Paper>

      {/* Timeline Info */}
      <Box sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
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