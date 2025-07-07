import { useState, useRef, useCallback } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Alert,
  Divider,
} from '@mui/material'
import { PhotoCamera, Refresh, CheckCircle, Upload, Error } from '@mui/icons-material'
import { StepProps } from '@/types/registration'

export const FaceRegistrationStep = ({ formData, onUpdateData, onNext }: StepProps) => {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(
    formData.photo ? URL.createObjectURL(formData.photo) : null
  )
  const [photoFile, setPhotoFile] = useState<File | null>(formData.photo || null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showFlash, setShowFlash] = useState(false)
  const [showSuccessCheck, setShowSuccessCheck] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      setIsCapturing(true)
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera not supported by this browser')
        setIsCapturing(false)
        return
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        },
        audio: false,
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error)
      setIsCapturing(false)
      
      // Provide user-friendly error messages
      if (error.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access and try again, or upload a photo instead.')
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found. Please upload a photo instead.')
      } else if (error.name === 'NotSupportedError') {
        setCameraError('Camera not supported. Please upload a photo instead.')
      } else {
        setCameraError('Camera not available. Please upload a photo instead.')
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      // 1. 立即显示白屏闪光效果
      setShowFlash(true)
      
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      
      if (context) {
        // Save the current context state
        context.save()
        
        // Flip the image horizontally to match user's expectation
        // Users expect the final photo to be unmirrored (normal orientation)
        context.translate(canvas.width, 0)
        context.scale(-1, 1)
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        
        // Restore the context state
        context.restore()
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' })
            const photoUrl = URL.createObjectURL(file)
            
            // 2. 短暂延迟后显示成功对勾
            setTimeout(() => {
              setShowFlash(false)
              setShowSuccessCheck(true)
              
              // 3. 1.5秒后隐藏对勾并显示照片
              setTimeout(() => {
                setShowSuccessCheck(false)
                setCapturedPhoto(photoUrl)
                setPhotoFile(file)
                onUpdateData({ photo: file })
                stopCamera()
              }, 1500)
            }, 150)
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }, [onUpdateData, stopCamera])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const photoUrl = URL.createObjectURL(file)
      setCapturedPhoto(photoUrl)
      setPhotoFile(file)
      onUpdateData({ photo: file })
    }
  }, [onUpdateData])

  const retakePhoto = useCallback(() => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto)
    }
    setCapturedPhoto(null)
    setPhotoFile(null)
    onUpdateData({ photo: undefined })
    setCameraError(null)
  }, [capturedPhoto, onUpdateData])

  const handleContinue = () => {
    onNext()
  }

  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 2 } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          mb: 1.5,
          textAlign: 'left',
          color: '#1d1d1f',
          fontSize: '1.75rem',
        }}
      >
        Get Ready to Shine in Every Photo!
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mb: 3,
          textAlign: 'left',
          color: '#6e6e73',
          lineHeight: 1.5,
          fontSize: '1rem',
        }}
      >
        Take a selfie so we can find you in event photos.
      </Typography>

      <Box sx={{ 
        width: '100%', 
        maxWidth: '100%',
        mx: 'auto'
      }}>
        {/* Error Alert */}
        {cameraError && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2, borderRadius: 2 }}
            icon={<Error aria-label="Error" />}
          >
            {cameraError}
          </Alert>
        )}

        {/* Camera/Photo Area */}
        <Paper
          elevation={3}
          sx={{
            mb: 2,
            borderRadius: 2,
            overflow: 'hidden',
            aspectRatio: '3/4',
            position: 'relative',
            backgroundColor: '#f5f5f5',
            width: '100%',
            minHeight: '400px',
            maxHeight: '500px',
          }}
        >
          {!capturedPhoto && !isCapturing && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 3,
                p: 4,
              }}
            >
              {/* Selfie Guide Placeholder */}
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  backgroundColor: '#f2f2f7',
                  border: '2px dashed #c7c7cc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Head */}
                  <circle
                    cx="30"
                    cy="20"
                    r="12"
                    fill="none"
                    stroke="#8e8e93"
                    strokeWidth="2"
                  />
                  
                  {/* Shoulders/Upper body */}
                  <path
                    d="M12 50 Q18 32 30 32 Q42 32 48 50"
                    fill="none"
                    stroke="#8e8e93"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  
                  {/* Simple face features */}
                  <circle cx="26" cy="18" r="1.5" fill="#8e8e93"/>
                  <circle cx="34" cy="18" r="1.5" fill="#8e8e93"/>
                  <path
                    d="M26 24 Q30 26 34 24"
                    stroke="#8e8e93"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </Box>

                            <Box sx={{ textAlign: 'center', maxWidth: 320, mb: 1, px: 1 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#1d1d1f',
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    fontWeight: 500,
                    lineHeight: 1.3,
                    mb: 0.5,
                  }}
                >
                  👀 Look at camera and smile!
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6e6e73',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    lineHeight: 1.3,
                  }}
                >
                  😊 Make sure your face is centered and clearly visible.
                </Typography>
              </Box>
            
              {/* File Upload Button */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 280 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PhotoCamera aria-label="" />}
                  onClick={startCamera}
                  disabled={isCapturing}
                  sx={{
                    width: '100%',
                    minHeight: { xs: 48, sm: 52 },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    backgroundColor: '#007aff',
                    boxShadow: '0 2px 12px rgba(0, 122, 255, 0.3)',
                    '&:hover': {
                      backgroundColor: '#0056b3',
                      boxShadow: '0 4px 16px rgba(0, 122, 255, 0.4)',
                    },
                  }}
                >
                  {isCapturing ? 'Opening Camera...' : 'Take Selfie'}
                </Button>

                {/* Divider */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    my: 3,
                  }}
                >
                  <Box sx={{ flex: 1, height: '1px', backgroundColor: '#e5e5e7' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      px: 2,
                      color: '#8e8e93',
                      fontSize: '0.875rem',
                    }}
                  >
                    or
                  </Typography>
                  <Box sx={{ flex: 1, height: '1px', backgroundColor: '#e5e5e7' }} />
                </Box>

                {/* Upload Link */}
                <Typography
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    color: '#007aff',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#0056b3',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Upload a photo instead
                </Typography>
              </Box>
            </Box>
          )}

          {isCapturing && !capturedPhoto && (
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                }}
              />
              
              {/* Face Guide - Natural Selfie Position */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '45%', // 符合举手自拍的实际人脸位置
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 220,
                  height: 260,
                  border: '3px dashed rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
              />

              {/* Camera Flash Effect */}
              {showFlash && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    zIndex: 10,
                    animation: 'flash 0.15s ease-out',
                    '@keyframes flash': {
                      '0%': { opacity: 0 },
                      '50%': { opacity: 1 },
                      '100%': { opacity: 0 },
                    },
                  }}
                />
              )}

              {/* Success Check Animation */}
              {showSuccessCheck && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 10,
                  }}
                >
                  <CheckCircle
                    sx={{
                      fontSize: 120,
                      color: '#4caf50',
                      animation: 'checkSuccess 1.5s ease-out',
                      '@keyframes checkSuccess': {
                        '0%': { 
                          transform: 'scale(0) rotate(0deg)',
                          opacity: 0 
                        },
                        '30%': { 
                          transform: 'scale(1.3) rotate(10deg)',
                          opacity: 1 
                        },
                        '50%': { 
                          transform: 'scale(1) rotate(-5deg)',
                          opacity: 1 
                        },
                        '70%': { 
                          transform: 'scale(1.1) rotate(0deg)',
                          opacity: 1 
                        },
                        '100%': { 
                          transform: 'scale(1) rotate(0deg)',
                          opacity: 1 
                        },
                      },
                    }}
                  />
                </Box>
              )}

              {/* Capture Button - Instagram Style */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 30,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Outer Ring */}
                <Box
                  onClick={capturePhoto}
                  sx={{
                    width: 80,
                    height: 80,
                    border: '4px solid rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      border: '4px solid rgba(255, 255, 255, 1)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  {/* Inner Circle */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '50%',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </Box>
              </Box>

              
            </Box>
          )}

          {capturedPhoto && (
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={capturedPhoto}
                alt="Captured selfie"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              
              {/* Success Icon */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                }}
              >
                <CheckCircle
                  sx={{
                    fontSize: { xs: 32, sm: 40 },
                    color: '#4caf50',
                    mb: 1,
                  }}
                  aria-label="Photo captured successfully"
                />
              </Box>

              {/* Retake Button */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <Button
                  onClick={retakePhoto}
                  variant="outlined"
                  startIcon={<Refresh aria-label="" />}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    },
                  }}
                >
                  Retake
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
} 