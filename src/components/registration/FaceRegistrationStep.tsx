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
import { CameraAlt, Refresh, CheckCircle, Upload, Error, PhotoCamera } from '@mui/icons-material'
import { StepProps } from '@/types/registration'

export const FaceRegistrationStep = ({ formData, onUpdateData, onNext }: StepProps) => {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(
    formData.photo ? URL.createObjectURL(formData.photo) : null
  )
  const [photoFile, setPhotoFile] = useState<File | null>(formData.photo || null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
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
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      
      if (context) {
        // Flip the canvas horizontally to correct the mirrored preview
        context.translate(canvas.width, 0)
        context.scale(-1, 1)
        
        // Draw the video frame
        context.drawImage(videoRef.current, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' })
            const photoUrl = URL.createObjectURL(file)
            
            setCapturedPhoto(photoUrl)
            setPhotoFile(file)
            onUpdateData({ photo: file })
            stopCamera()
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
          mb: { xs: 1.5, sm: 2, md: 2.5 },
          textAlign: 'left',
          color: 'text.primary',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
        }}
      >
        Face Registration
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
        Take a quick selfie for face recognition. This helps us find you in event photos automatically.
      </Typography>

      <Box sx={{ maxWidth: { xs: 360, sm: 400, md: 440 } }}>
        {/* Error Alert */}
        {cameraError && (
          <Alert 
            severity="warning" 
            sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2 }}
            icon={<Error />}
          >
            {cameraError}
          </Alert>
        )}

        {/* Camera/Photo Area */}
        <Paper
          elevation={3}
          sx={{
            mb: { xs: 2, sm: 3 },
            borderRadius: 2,
            overflow: 'hidden',
            aspectRatio: '4/3',
            position: 'relative',
            backgroundColor: '#f5f5f5',
            minHeight: { xs: '200px', sm: '250px', md: '300px' },
            maxHeight: { xs: '280px', sm: '350px', md: '400px' },
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
                gap: 2,
                p: 3,
              }}
            >

              <Typography variant="body2" color="text.secondary" textAlign="center">
                📸 Position your face in the frame<br />
                😊 Look directly at the camera<br />
                💡 Make sure lighting is good<br />
              </Typography>
            
              {/* File Upload Button */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={() => fileInputRef.current?.click()}
                size="large"
              >
                Upload Selfie
              </Button>
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
              
              {/* Circle Guide */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 200,
                  height: 200,
                  border: '3px solid #1976d2',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
              />

              {/* Capture Button */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <IconButton
                  onClick={capturePhoto}
                  sx={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    width: 64,
                    height: 64,
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  }}
                >
                  <CameraAlt sx={{ fontSize: 32 }} />
                </IconButton>
              </Box>

              {/* Cancel Button */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                }}
              >
                <Button
                  onClick={stopCamera}
                  variant="outlined"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    },
                  }}
                >
                  Cancel
                </Button>
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
                <CheckCircle sx={{ fontSize: 32, color: '#4caf50' }} />
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
                  startIcon={<Refresh />}
                  variant="outlined"
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