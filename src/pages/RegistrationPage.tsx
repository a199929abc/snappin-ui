import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Box, Container, Typography } from '@mui/material'
import { StepIndicator } from '@/components/registration/StepIndicator'
import { BasicInfoStep } from '@/components/registration/BasicInfoStep'
import { OTPVerificationStep } from '@/components/registration/OTPVerificationStep'
import { FaceRegistrationStep } from '@/components/registration/FaceRegistrationStep'
import { CompletionStep } from '@/components/registration/CompletionStep'
import { RegistrationData } from '@/types/registration'
import { apiService, EventInfo } from '@/services/api'
import { PageLayout } from '@/components/shared/PageLayout'
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
  
  // Event-related states (for backend validation only, not displayed)  
  const [, setEventInfo] = useState<EventInfo | null>(null)
  const [eventError, setEventError] = useState<string | null>(null)

  const totalSteps = 3

  // Load event info if slug is provided (silently in background)
  useEffect(() => {
    if (slug) {
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

  const renderBottomButton = () => {
    // 底部按钮容器统一样式
    const buttonContainerStyle = {
      maxWidth: '400px',
      mx: 'auto',
      width: '100%',
      px: { xs: 2, sm: 3 },
    }

    // 按钮统一样式
    const buttonStyle = {
      py: 1.2,
      px: 3,
      fontSize: '0.95rem',
      fontWeight: 600,
      borderRadius: 2,
      textTransform: 'none',
      minHeight: 44,
      maxWidth: 400,
      mx: 'auto',
    }

    switch (currentStep) {
      case 1:
        return (
          <Box sx={buttonContainerStyle}>
            <Button
              onClick={handleNext}
              fullWidth
              variant="contained"
              size="large"
              disabled={!isFormValid}
              sx={buttonStyle}
            >
              Continue
            </Button>
          </Box>
        )
      case 2:
        // OTP step - only Back button, auto-advances on success
        return (
          <Box sx={buttonContainerStyle}>
            <Button
              onClick={handleBack}
              variant="outlined"
              size="large"
              sx={buttonStyle}
            >
              Back
            </Button>
          </Box>
        )
      case 3:
        return (
          <Box sx={buttonContainerStyle}>
            <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 } }}>
              <Button
                onClick={handleBack}
                variant="outlined"
                size="large"
                disabled={isSubmitting}
                sx={{
                  ...buttonStyle,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                variant="contained"
                size="large"
                disabled={!isFormValid || isSubmitting}
                sx={{
                  ...buttonStyle,
                  flex: 2, // Submit button is wider
                  minWidth: 0,
                }}
              >
                Submit Registration
              </Button>
            </Box>
          </Box>
        )
      case 4:
        return (
          <Box sx={buttonContainerStyle}>
            <Button
              onClick={() => window.location.href = import.meta.env.VITE_COMPANY_WEBSITE || 'https://www.snappin.ca'}
              fullWidth
              variant="contained"
              size="large"
              sx={buttonStyle}
            >
              Close
            </Button>
          </Box>
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
    <PageLayout 
      maxWidth="md"
      showHeader={false}
      showBottomActions={true}
      isLoading={isSubmitting}
      bottomActionsContent={renderBottomButton()}
    >
      {/* 双层Container实现宽度控制 */}
      <Container 
        maxWidth={false}
        sx={{ 
          maxWidth: '600px',
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: { xs: '75vh', sm: '78vh', md: '80vh' }
        }}
      >
        {/* 第1层：品牌层 - 独立24px间距 */}
        <Box sx={{ 
          textAlign: 'left', 
          mb: 3, // 固定24px间距
          pt: 1,
        }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: { xs: 32, sm: 36, md: 40 },
                height: { xs: 32, sm: 36, md: 40 },
                borderRadius: 1.5,
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
              }}
            >
              <Typography
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                }}
              >
                S
              </Typography>
            </Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' },
                letterSpacing: '-0.02em',
              }}
            >
              {import.meta.env.VITE_APP_NAME || 'SNAPPIN'}
            </Typography>
          </Box>
        </Box>

        {/* 第2层：导航层 - 步骤指示器 */}
        {currentStep <= 3 && (
        <Box sx={{ 
          mb: { xs: '4vh', sm: '5vh', md: '6vh' },
          maxWidth: '500px',
          mx: 'auto',
          width: '100%'
        }}>
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </Box>
        )}

        {/* 第3层：内容层 - 错误提示独立块 */}
        {submitError && (
          <Box sx={{ 
            mb: 3,
            maxWidth: '550px',
            mx: 'auto',
            width: '100%'
          }}>
            <ErrorDisplay 
              error={submitError} 
              onDismiss={() => setSubmitError(null)}
              variant="inline"
            />
          </Box>
        )}

        {/* OTP错误提示 */}
        {otpError && (
          <Box sx={{ 
            mb: 3,
            maxWidth: '550px',
            mx: 'auto',
            width: '100%'
          }}>
            <ErrorDisplay 
              error={otpError} 
              onDismiss={() => setOtpError(null)}
              variant="inline"
            />
          </Box>
        )}

        {/* 第4层：表单内容区 */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '550px',
          mx: 'auto',
          width: '100%',
          minHeight: { xs: '45vh', sm: '48vh', md: '50vh' }
        }}>
          {renderCurrentStep()}
        </Box>
      </Container>
    </PageLayout>
  )
} 