import React from 'react'
import { Alert, Snackbar, Box, CircularProgress, Typography } from '@mui/material'

interface StatusSnackbarProps {
  open: boolean
  onClose: () => void
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
  autoHideDuration?: number
}

export const StatusSnackbar: React.FC<StatusSnackbarProps> = ({
  open,
  onClose,
  message,
  severity,
  autoHideDuration = severity === 'error' ? 6000 : 4000
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={severity} onClose={onClose} sx={{ borderRadius: 2 }}>
        {message}
      </Alert>
    </Snackbar>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...'
}) => {
  if (!isLoading) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: 2,
      }}
    >
      <CircularProgress 
        size={120} 
        thickness={4}
        color="primary"
      />
      <Typography
        variant="h6"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
        }}
      >
        {message}
      </Typography>
    </Box>
  )
}

interface InlineLoadingProps {
  isLoading: boolean
  message?: string
  size?: number
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  isLoading,
  message = 'Loading...',
  size = 40
}) => {
  if (!isLoading) return null

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        gap: 2,
      }}
    >
      <CircularProgress 
        size={size} 
        thickness={4}
        color="primary"
      />
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
        }}
      >
        {message}
      </Typography>
    </Box>
  )
}

interface ErrorDisplayProps {
  error: string | null
  onDismiss?: () => void
  variant?: 'alert' | 'inline'
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onDismiss,
  variant = 'alert'
}) => {
  if (!error) return null

  if (variant === 'inline') {
    return (
      <Box sx={{ py: 2 }}>
        <Alert 
          severity="error" 
          sx={{ borderRadius: 2 }}
          onClose={onDismiss}
        >
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Alert 
      severity="error" 
      sx={{ mb: 3, borderRadius: 2 }}
      onClose={onDismiss}
    >
      {error}
    </Alert>
  )
} 