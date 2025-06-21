import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'
import { Box, TextField } from '@mui/material'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: boolean
  autoFocus?: boolean
}

export const OTPInput = ({
  length = 4,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
}: OTPInputProps) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize otp array from value prop
  useEffect(() => {
    const newOtp = Array(length).fill('')
    for (let i = 0; i < Math.min(value.length, length); i++) {
      newOtp[i] = value[i] || ''
    }
    setOtp(newOtp)
  }, [value, length])

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus, disabled])

  const handleChange = (index: number, newValue: string) => {
    // Only allow digits
    if (newValue && !/^\d$/.test(newValue)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = newValue

    setOtp(newOtp)
    
    // Update parent component
    const otpString = newOtp.join('')
    onChange(otpString)

    // Auto-advance to next input
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Call onComplete when all fields are filled
    if (otpString.length === length && onComplete) {
      onComplete(otpString)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current field is empty, move to previous field and clear it
        inputRefs.current[index - 1]?.focus()
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        onChange(newOtp.join(''))
      } else {
        // Clear current field
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        onChange(newOtp.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '')
    
    if (pastedData.length >= length) {
      const newOtp = pastedData.slice(0, length).split('')
      setOtp(newOtp)
      onChange(newOtp.join(''))
      
      // Focus the last input
      inputRefs.current[length - 1]?.focus()
      
      // Call onComplete if we have a full OTP
      if (newOtp.join('').length === length && onComplete) {
        onComplete(newOtp.join(''))
      }
    }
  }

  const handleFocus = (index: number) => {
    // Select all text when focusing
    inputRefs.current[index]?.select()
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        maxWidth: 200,
        mx: 'auto'
      }}
    >
      {Array.from({ length }, (_, index) => (
        <TextField
          key={index}
          inputRef={(el) => (inputRefs.current[index] = el)}
          value={otp[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          error={error}
          inputProps={{
            maxLength: 1,
            style: {
              textAlign: 'center',
              fontSize: '1.25rem',
              fontWeight: '500',
              letterSpacing: '0.1em'
            },
            inputMode: 'numeric',
            pattern: '[0-9]*',
          }}
          sx={{
            width: 40,
            '& .MuiOutlinedInput-root': {
              height: 48,
              borderRadius: 1.5,
              '& fieldset': {
                borderColor: error ? 'error.main' : 'grey.300',
                borderWidth: 1.5,
              },
              '&:hover fieldset': {
                borderColor: error ? 'error.main' : 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: error ? 'error.main' : 'primary.main',
                borderWidth: 2,
              },
              '&.Mui-disabled': {
                backgroundColor: 'grey.50',
                '& fieldset': {
                  borderColor: 'grey.200',
                },
              },
            },
            '& .MuiOutlinedInput-input': {
              padding: 0,
            },
          }}
        />
      ))}
    </Box>
  )
} 