import { useState } from 'react'
import { Box, FormControlLabel, Checkbox, Typography, Link } from '@mui/material'
import { Security } from '@mui/icons-material'
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

  return (
    <>
      <Box sx={{ 
        mt: { xs: 2, sm: 3 },
        p: { xs: 2, sm: 2.5 },
        bgcolor: 'grey.50',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200'
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          mb: 1
        }}>
          <Security 
            sx={{ 
              color: 'primary.main',
              fontSize: { xs: 20, sm: 24 },
              mt: 0.5
            }} 
          />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            AI Photo Recognition Service
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: 'text.secondary',
            lineHeight: 1.5,
            fontSize: { xs: '0.85rem', sm: '0.9rem' }
          }}
        >
          We use face recognition to automatically find you in event photos. 
          This helps us match your photos quickly and accurately.
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
             
              color="primary"
              sx={{ 
                '& .MuiSvgIcon-root': { 
                  fontSize: { xs: 20, sm: 24 } 
                } 
              }}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: 'text.primary',
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              I agree to use face recognition for photo matching
              {required && (
                <Typography
                  component="span"
                  sx={{ color: 'error.main', ml: 0.5 }}
                >
                  *
                </Typography>
              )}
            </Typography>
          }
          sx={{ 
            alignItems: 'flex-start',
            ml: 0,
            '& .MuiFormControlLabel-label': {
              ml: 1
            }
          }}
        />

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 1,
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.8rem' }
          }}
        >
          Required for our AI photo recognition service. 
          <Link 
            component="button"
            onClick={handlePrivacyClick}
            sx={{ 
              ml: 0.5,
              textDecoration: 'none',
              cursor: 'pointer',
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