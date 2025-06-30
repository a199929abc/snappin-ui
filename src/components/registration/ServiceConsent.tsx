import React, { useState, useEffect } from 'react'
import { Box, Typography, Link } from '@mui/material'
import { PrivacyModal } from './PrivacyModal'

interface ServiceConsentProps {
  checked: boolean
  onChange: (checked: boolean) => void
  required?: boolean
}

export const ServiceConsent = ({ 
  checked, 
  onChange, 
  required = true 
}: ServiceConsentProps) => {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setPrivacyModalOpen(true)
  }

  // Automatically set consent to true when component mounts
  // since this is now implicit consent through the "continue" action
  useEffect(() => {
    if (!checked) {
      onChange(true)
    }
  }, [checked, onChange])

  return (
    <>
      <Box sx={{ 
        mt: { xs: 1, sm: 1.5 },
        mb: { xs: 0.5, sm: 1 }
      }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            fontWeight: 400,
            lineHeight: 1.4,
            textAlign: 'left'
          }}
        >
          By continuing, you agree to photo matching to find you in event pictures. We only use your info for this event.{' '}
          <Link 
            component="button"
            onClick={handlePrivacyClick}
            sx={{ 
              fontSize: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              color: 'primary.main',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Privacy Policy
          </Link>
        </Typography>
      </Box>

      <PrivacyModal 
        open={privacyModalOpen} 
        onClose={() => setPrivacyModalOpen(false)} 
      />
    </>
  )
} 