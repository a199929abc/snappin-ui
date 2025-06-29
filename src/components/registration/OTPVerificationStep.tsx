import React, { useState, useEffect, useRef } from 'react'
import { Box, Typography, CircularProgress, Link } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { OTPInput } from './OTPInput'
import { StepProps } from '@/types/registration'
import { apiService } from '@/services/api'

interface OTPStepProps extends StepProps {
  onError?: (error: string | null) => void
}

export const OTPVerificationStep = ({ formData, onUpdateData, onNext, onBack, onError }: OTPStepProps) => {
  const [otpValue, setOtpValue] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const hasSentInitialOTP = useRef(false)

  // Mask email for privacy
  const maskEmail = (email: string) => {
    if (!email) return ''
    const [username, domain] = email.split('@')
    if (username.length <= 2) return email
    const maskedUsername = username[0] + '*'.repeat(Math.min(username.length - 2, 6)) + username.slice(-1)
    return `${maskedUsername}@${domain}`
  }

  // Start countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  // Auto-send OTP when component mounts (only once)
  useEffect(() => {
    if (formData.email && !formData.emailVerified && !hasSentInitialOTP.current) {
      hasSentInitialOTP.current = true
      handleSendOTP()
    }
  }, []) // Empty dependency array ensures this runs only once

  const handleSendOTP = async () => {
    if (!formData.email || isSending) return // Prevent multiple simultaneous requests
    
    setIsSending(true)
    onError?.(null) // Clear any existing errors
    
    try {
      await apiService.sendOTP({
        email: formData.email,
        purpose: 'email_verification'
      })
      setResendCountdown(60) // Set 60-second cooldown
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code'
      onError?.(errorMessage)
    } finally {
      setIsSending(false)
    }
  }

  const handleVerifyOTP = async (code: string) => {
    if (!formData.email) return
    
    setIsVerifying(true)
    onError?.(null) // Clear any existing errors
    
    try {
      await apiService.verifyOTP({
        email: formData.email,
        code,
        purpose: 'email_verification'
      })
      
      setSuccess(true)
      onUpdateData({ emailVerified: true })
      
      // Auto-advance to next step after brief success display
      setTimeout(() => {
        onNext()
      }, 1500)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed'
      onError?.(errorMessage)
      setOtpValue('') // Clear the input on error
    } finally {
      setIsVerifying(false)
    }
  }

  const handleOTPChange = (value: string) => {
    setOtpValue(value)
    onError?.(null) // Clear error when user starts typing
  }

  const handleOTPComplete = (value: string) => {
    if (value.length === 4 && !isVerifying) {
      handleVerifyOTP(value)
    }
  }

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: 400,
      mx: 'auto',
      textAlign: 'center',
      py: { xs: 2, sm: 4 }
    }}>
      {/* Title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 600,
          mb: 2,
          fontSize: { xs: '1.5rem', sm: '1.75rem' },
          color: 'text.primary'
        }}
      >
        Verify Your Email
      </Typography>

      {/* Description */}
      <Typography
        variant="body1"
        sx={{
          mb: 4,
          color: 'text.secondary',
          fontSize: '1rem',
          lineHeight: 1.5
        }}
      >
        Enter the 4-digit code sent to {maskEmail(formData.email)}
      </Typography>

      {/* Success State */}
      {success && (
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          mb: 4,
          py: 2,
        }}>
          <CircularProgress 
            size={40} 
            thickness={4}
            color="primary"
          />
        </Box>
      )}

      {/* OTP Input */}
      {!success && (
        <>
          <Box sx={{ mb: 4 }}>
            <OTPInput
              value={otpValue}
              onChange={handleOTPChange}
              onComplete={handleOTPComplete}
              disabled={isVerifying || success}
              error={false} // Remove error prop since errors are handled by parent
              autoFocus
            />

            {isVerifying && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 1,
                mt: 2
              }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Verifying...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Resend Section */}
          <Box>
            {resendCountdown > 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.875rem' }}
              >
                Resend code in {resendCountdown}s
              </Typography>
            ) : (
              <Typography
                variant="body2"
                sx={{ fontSize: '0.875rem' }}
              >
                Didn't receive the code?{' '}
                <Link
                  component="button"
                  onClick={handleSendOTP}
                  disabled={isSending}
                  sx={{ 
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isSending ? 'Sending...' : 'Resend'}
                </Link>
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  )
} 