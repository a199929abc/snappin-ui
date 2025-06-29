import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Box, Container, Typography, Card, CardContent } from '@mui/material'
import { CalendarToday, LocationOn } from '@mui/icons-material'
import { StepIndicator } from '@/components/registration/StepIndicator'
import { BasicInfoStep } from '@/components/registration/BasicInfoStep'
import { OTPVerificationStep } from '@/components/registration/OTPVerificationStep'
import { FaceRegistrationStep } from '@/components/registration/FaceRegistrationStep'
import { CompletionStep } from '@/components/registration/CompletionStep'
import { RegistrationData } from '@/types/registration'
import { apiService, EventInfo } from '@/services/api'
import { ErrorDisplay } from '@/components/shared/StatusComponents'

export const RegistrationPage = () => {
  const { slug } = useParams<{ slug?: string }>()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    phone: '',
    instagram: '',
    photo: undefined,
    serviceConsent: false,
    emailVerified: false,
  })
  const [isFormValid, setIsFormValid] = useState(false)
  
  // API-related states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)
  
  // Event-related states
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null)
  const [eventError, setEventError] = useState<string | null>(null)
  const [bannerLoaded, setBannerLoaded] = useState(false)
  const [bannerError, setBannerError] = useState(false)

  const totalSteps = 3

  // Load event info if slug is provided (silently in background)
  useEffect(() => {
    if (slug) {
      // Reset banner states
      setBannerLoaded(false)
      setBannerError(false)
      
      apiService.getEventInfo(slug)
        .then((event) => {
          setEventInfo(event)
        })
        .catch((error) => {
          console.error('Failed to load event info:', error)
          setEventError(error.message)
        })
    }
  }, [slug])

  useEffect(() => {
    // Update form validation when step changes
    if (currentStep === 1) {
      setIsFormValid(!!(formData.name && formData.email && formData.serviceConsent))
    } else if (currentStep === 2) {
      setIsFormValid(!!formData.emailVerified)
    } else if (currentStep === 3) {
      setIsFormValid(!!formData.photo)
    } else {
      setIsFormValid(true) // Completion step is always valid
    }
  }, [currentStep, formData])

  const handleUpdateData = (data: Partial<RegistrationData>) => {
    const updatedData = { ...formData, ...data }
    setFormData(updatedData)
  }

  const handleNext = async () => {
    // Clear any previous errors
    setSubmitError(null)
    setOtpError(null)

    // Step 3: Submit registration to backend (was previously step 2)
    if (currentStep === 3) {
      setIsSubmitting(true)
      
      try {
        if (!formData.photo) {
          setSubmitError('Please capture or upload a photo before continuing.')
          setIsSubmitting(false)
          return
        }

        // Choose API method based on whether we have an event slug
        if (slug) {
          // Event-based registration
          const response = await apiService.registerForEvent(slug, {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || '',
            instagram: formData.instagram || '',
            photo: formData.photo,
            serviceConsent: formData.serviceConsent,
          })
          console.log('Event registration successful:', response.message)
        } else {
          // Legacy registration (fallback)
          const response = await apiService.registerWithPhoto({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || '',
            instagram: formData.instagram || '',
            photo: formData.photo,
            serviceConsent: formData.serviceConsent,
          })
          console.log('Registration successful:', response.message)
        }

        setCurrentStep(4) // Go to completion step
        
      } catch (error) {
        // API service now properly handles structured errors from backend
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Registration failed. Please try again.'
        setSubmitError(errorMessage)
        console.error('Registration error:', error)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Normal step progression for steps 1 and 2
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  const handleBack = () => {
    // Clear errors when going back
    setSubmitError(null)
    setOtpError(null)
    
    if (currentStep > 1) {
      // Clear photo when going back from Step 3 to Step 2
      if (currentStep === 3) {
        setFormData(prev => ({ ...prev, photo: undefined }))
      }
      // Clear email verification when going back from Step 2 to Step 1
      if (currentStep === 2) {
        setFormData(prev => ({ ...prev, emailVerified: false }))
      }
      setCurrentStep(prev => prev - 1)
    }
  }

  const renderCurrentStep = () => {
    const stepProps = {
      formData,
      onUpdateData: handleUpdateData,
      onNext: handleNext,
      onBack: currentStep > 1 ? handleBack : undefined,
    }

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...stepProps} />
      case 2:
        return <OTPVerificationStep {...stepProps} onError={setOtpError} />
      case 3:
        return <FaceRegistrationStep {...stepProps} />
      case 4:
        return <CompletionStep {...stepProps} />
      default:
        return <BasicInfoStep {...stepProps} />
    }
  }

  // Format date for display
  const formatEventDate = (dateString?: string) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return null
    }
  }

  const renderBottomButton = () => {
    // 按钮统一样式 - 渐变效果
    const buttonStyle = {
      py: 1,
      px: 3,
      fontSize: '0.95rem',
      fontWeight: 600,
      borderRadius: 2,
      textTransform: 'none',
      height: 44,
      background: 'linear-gradient(135deg, #1976d2 0%, #3f51b5 100%)',
      '&:hover': {
        background: 'linear-gradient(135deg, #1565c0 0%, #303f9f 100%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
      },
      '&:disabled': {
        background: '#e0e0e0',
        transform: 'none',
        boxShadow: 'none',
      },
      transition: 'all 0.2s ease-in-out',
    }

    const outlineButtonStyle = {
      py: 1,
      px: 3,
      fontSize: '0.95rem',
      fontWeight: 600,
      borderRadius: 2,
      textTransform: 'none',
      height: 44,
      borderColor: '#1976d2',
      color: '#1976d2',
      '&:hover': {
        borderColor: '#1565c0',
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
        transform: 'translateY(-1px)',
      },
      transition: 'all 0.2s ease-in-out',
    }

    switch (currentStep) {
      case 1:
        return (
          <Button
            onClick={handleNext}
            fullWidth
            variant="contained"
            size="medium"
            disabled={!isFormValid}
            sx={buttonStyle}
          >
            Continue
          </Button>
        )
      case 2:
        return (
          <Button
            onClick={handleBack}
            variant="outlined"
            size="medium"
            sx={outlineButtonStyle}
          >
            Back
          </Button>
        )
      case 3:
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={handleBack}
              variant="outlined"
              size="medium"
              disabled={isSubmitting}
              sx={{ ...outlineButtonStyle, flex: 1 }}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              variant="contained"
              size="medium"
              disabled={!isFormValid || isSubmitting}
              sx={{ ...buttonStyle, flex: 2 }}
            >
              Submit Registration
            </Button>
          </Box>
        )
      case 4:
        return (
          <Button
            onClick={() => window.location.href = import.meta.env.VITE_COMPANY_WEBSITE || 'https://www.snappin.ca'}
            fullWidth
            variant="contained"
            size="medium"
            sx={buttonStyle}
          >
            Close
          </Button>
        )
      default:
        return null
    }
  }

  // If there's an event error, show it but don't block the UI
  if (slug && eventError) {
    console.error('Event loading error:', eventError)
    // Continue with normal UI, just log the error
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #f3e5f5 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: { xs: 0.5, sm: 1 },
      py: { xs: 1, sm: 2 },
    }}>
      <Container maxWidth="md" sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Event Banner - 16:9 Aspect Ratio - Only show on first step */}
        {eventInfo && currentStep === 1 && (
          <Card
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              mb: 1,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: 'none',
              // 16:9 aspect ratio using paddingBottom for better mobile support
              height: 0,
              paddingBottom: '56.25%', // 9/16 = 0.5625
              minHeight: { xs: '200px', sm: '250px' }, // Minimum height for mobile
            }}
            elevation={0}
          >
            {/* Background Image or Gradient */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: (eventInfo.banner?.url && !bannerError)
                  ? `url(${eventInfo.banner.url})`
                  : 'linear-gradient(135deg, #1976d2 0%, #3f51b5 50%, #9c27b0 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: (eventInfo.banner?.url && !bannerLoaded && !bannerError) ? 0.7 : 1,
                transition: 'opacity 0.3s ease-in-out',
              }}
            />

            {/* Preload banner image if exists */}
            {eventInfo.banner?.url && (
              <Box
                component="img"
                src={eventInfo.banner.url}
                alt={`${eventInfo.name} banner`}
                onLoad={() => setBannerLoaded(true)}
                onError={() => setBannerError(true)}
                sx={{
                  position: 'absolute',
                  width: 0,
                  height: 0,
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Floor Fade Gradient for professional text readability */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: eventInfo.banner?.url 
                  ? 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.5) 100%)'
                  : 'transparent',
              }}
            />
            
            {/* Content Overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                px: { xs: 2, sm: 3 },
                py: { xs: 2, sm: 3 },
                color: 'white',
              }}
            >
 
          
              
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                  letterSpacing: '-0.01em',
                  lineHeight: 1.1,
                  textShadow: '0 3px 8px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.8)',
                }}
              >
                {eventInfo.name}
              </Typography>
              

              
              {/* Event Details */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row',
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 2, 
                color: 'rgba(255, 255, 255, 0.95)',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.6)',
                flexWrap: 'wrap'
              }}>
                {formatEventDate(eventInfo.start_time) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarToday sx={{ fontSize: { xs: 14, sm: 16 } }} />
                    <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
                      {formatEventDate(eventInfo.start_time)}
                    </Typography>
                  </Box>
                )}
                
                {eventInfo.location && (
                  <>
                    <Box sx={{ 
                      width: 4, 
                      height: 4, 
                      bgcolor: 'rgba(255, 255, 255, 0.7)', 
                      borderRadius: '50%'
                    }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn sx={{ fontSize: { xs: 14, sm: 16 } }} />
                      <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
                        {eventInfo.location}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Card>
        )}

        {/* Registration Card */}
        <Card
          sx={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            minHeight: currentStep === 1 && eventInfo ? 'auto' : { xs: 'auto', sm: '400px' },
            maxWidth: { xs: '100%', sm: '600px', md: '800px', lg: '900px' },
            mx: 'auto',
          }}
          elevation={0}
        >
          <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
            {/* Header - Only show for non-event registrations */}
            {!eventInfo && (
              <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      backgroundColor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
                    }}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
                      S
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: '1.5rem',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {import.meta.env.VITE_APP_NAME || 'SNAPPIN'}
                  </Typography>
                </Box>
                
                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  Event Registration
                </Typography>
              </Box>
            )}

            {/* Step Indicator */}
            {currentStep <= 3 && (
              <Box sx={{ mb: 1.5, mt: eventInfo ? 0 : 1 }}>
                <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
              </Box>
            )}

            {/* Error Messages */}
            {submitError && (
              <Box sx={{ mb: 1.5 }}>
                <ErrorDisplay 
                  error={submitError} 
                  onDismiss={() => setSubmitError(null)}
                  variant="inline"
                />
              </Box>
            )}

            {otpError && (
              <Box sx={{ mb: 1.5 }}>
                <ErrorDisplay 
                  error={otpError} 
                  onDismiss={() => setOtpError(null)}
                  variant="inline"
                />
              </Box>
            )}

            {/* Form Content */}
            <Box sx={{ mb: 1.5 }}>
              {renderCurrentStep()}
            </Box>

            {/* Bottom Button */}
            <Box>
              {renderBottomButton()}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
} 