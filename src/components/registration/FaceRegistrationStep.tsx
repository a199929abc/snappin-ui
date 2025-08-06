import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,

} from '@mui/material'
import { PhotoCamera, Refresh, CheckCircle, Error, Face, CameraAlt, Favorite, PanTool } from '@mui/icons-material'
import { StepProps } from '@/types/registration'
import selfie1 from '@/assets/selfie1.png'
import selfie2 from '@/assets/selfie2.png'
import selfie3 from '@/assets/selfie3.png'
import selfie4 from '@/assets/selfie4.png'

// 自拍场景照片数据
const selfieScenes = [
  {
    image: selfie1,
    color: "#1976d2",
    bgColor: "rgba(25, 118, 210, 0.1)"
  },
  {
    image: selfie2,
    color: "#9c27b0",
    bgColor: "rgba(156, 39, 176, 0.1)"
  },
  {
    image: selfie3,
    color: "#e91e63",
    bgColor: "rgba(233, 30, 99, 0.1)"
  },
  {
    image: selfie4,
    color: "#ff9800",
    bgColor: "rgba(255, 152, 0, 0.1)"
  }
]

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
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // 轮播动画效果
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSceneIndex((prevIndex) => 
        (prevIndex + 1) % selfieScenes.length
      )
    }, 2000) // 每2秒切换

    return () => clearInterval(interval)
  }, [])

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
        setCameraError('Camera permission denied. Please allow camera access in your browser settings and try again.')
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera detected. Please ensure your device has a working camera.')
      } else if (error.name === 'NotSupportedError') {
        setCameraError('Camera not supported by your browser. Please try using a different browser.')
      } else {
        setCameraError('Camera not available. Please check your device settings and try again.')
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
          lineHeight: 1.6,
          fontSize: { xs: '1rem', sm: '1.1rem' },
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
            borderRadius: 3,
            overflow: 'hidden',
            aspectRatio: '3/4',
            position: 'relative',
            backgroundColor: '#f5f5f5',
            width: '100%',
            minHeight: { xs: '480px', sm: '560px' },
            maxHeight: { xs: '560px', sm: '640px' },
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
                gap: { xs: 2.5, sm: 3.5 },
                p: { xs: 3, sm: 4 },
                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(63, 81, 181, 0.02) 100%)',
                minHeight: { xs: '420px', sm: '500px' },
              }}
            >
              {/* Modern Animated Face Icon */}
              <Box
                sx={{
                  position: 'relative',
                  mb: { xs: 2, sm: 3 },
                  // 扩大动画区域，增强视觉吸引力
                  maxWidth: '100%',
                  maxHeight: { xs: '280px', sm: '320px' },
                }}
              >
                {/* Current Scene Data */}
                {(() => {
                  const currentScene = selfieScenes[currentSceneIndex]
                  
                  return (
                    <>
                      {/* Outer glow ring - 响应式尺寸 */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: { xs: 200, sm: 240, md: 300 },
                          height: { xs: 240, sm: 280, md: 360 },
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${currentScene.bgColor} 0%, ${currentScene.bgColor} 100%)`,
                          animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                          transition: 'all 0.5s ease-in-out',
                          '@keyframes pulse': {
                            '0%, 100%': {
                              opacity: 0.6,
                              transform: 'translate(-50%, -50%) scale(1)',
                            },
                            '50%': {
                              opacity: 0.8,
                              transform: 'translate(-50%, -50%) scale(1.05)',
                            },
                          },
                        }}
                      />
                      
                      {/* Main elliptical container - 响应式尺寸 */}
                      <Box
                        sx={{
                          width: { xs: 180, sm: 220, md: 280 },
                          height: { xs: 220, sm: 260, md: 340 },
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          border: `3px solid ${currentScene.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 8px 32px ${currentScene.color}20, 0 2px 8px ${currentScene.color}15`,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.5s ease-in-out',
                        }}
                      >
                        {/* Selfie Photo - 响应式尺寸 */}
                        <Box
                          component="img"
                          src={currentScene.image}
                          alt="Selfie example"
                          sx={{
                            width: '90%',
                            height: '90%',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            transition: 'all 0.3s ease-in-out',
                            animation: 'fadeIn 0.5s ease-in-out',
                            '@keyframes fadeIn': {
                              '0%': { opacity: 0, transform: 'scale(0.8)' },
                              '100%': { opacity: 1, transform: 'scale(1)' },
                            },
                          }}
                        />
                        
                        {/* Subtle highlight overlay */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                          }}
                        />
                      </Box>
                    </>
                  )
                })()}
              </Box>


            
              {/* Single Action Button - Centered and Prominent */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                width: '100%', 
                maxWidth: 400, 
                gap: { xs: 2, sm: 3 }
              }}>
                {/* Primary CTA Button - Enhanced */}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PhotoCamera sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }} />}
                  onClick={startCamera}
                  disabled={isCapturing}
                  sx={{
                    width: '100%',
                    minHeight: { xs: 56, sm: 64 },
                    borderRadius: 4,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15)',
                    border: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
                    },
                    '&:active': {
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      background: '#e0e0e0',
                      transform: 'none',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {isCapturing ? 'Opening Camera...' : 'Take Selfie'}
                </Button>

                {/* Enhanced Helper Text */}
                <Box sx={{ textAlign: 'center', maxWidth: 350 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 500,
                      textAlign: 'center',
                      lineHeight: 1.5,
                      px: 1,
                      mb: 0.5,
                    }}
                  >
                    📸 Position your face in the center
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#999',
                      fontSize: '0.85rem',
                      fontWeight: 400,
                      textAlign: 'center',
                      lineHeight: 1.4,
                      px: 1,
                    }}
                  >
                    Make sure you're in good lighting for best results
                  </Typography>
                </Box>
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
                  top: '45%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 220,
                  height: 260,
                  border: '3px dashed rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  animation: 'guidePulse 2s ease-in-out infinite',
                  '@keyframes guidePulse': {
                    '0%, 100%': {
                      borderColor: 'rgba(255,255,255,0.7)',
                      transform: 'translate(-50%, -50%) scale(1)',
                    },
                    '50%': {
                      borderColor: 'rgba(255,255,255,0.9)',
                      transform: 'translate(-50%, -50%) scale(1.02)',
                    },
                  },
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

              {/* Enhanced Capture Button Area */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {/* Outer Ring */}
                <Box
                  onClick={capturePhoto}
                  sx={{
                    width: 90,
                    height: 90,
                    border: '5px solid rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    animation: 'breathe 3s ease-in-out infinite',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      border: '5px solid rgba(255, 255, 255, 1)',
                      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                    '@keyframes breathe': {
                      '0%, 100%': {
                        transform: 'scale(1)',
                      },
                      '50%': {
                        transform: 'scale(1.03)',
                      },
                    },
                  }}
                >
                  {/* Inner Circle */}
                  <Box
                    sx={{
                      width: 68,
                      height: 68,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '50%',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PhotoCamera 
                      sx={{ 
                        fontSize: 24, 
                        color: '#1976d2',
                        opacity: 0.8,
                      }} 
                    />
                  </Box>
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