import { useForm, Controller, useWatch } from 'react-hook-form'
import { useEffect } from 'react'
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material'
import { Phone, Email, Person } from '@mui/icons-material'
import { FaInstagram } from 'react-icons/fa'
import { StepProps, RegistrationData } from '@/types/registration'
import { ServiceConsent } from './ServiceConsent'

export const BasicInfoStep = ({ formData, onUpdateData }: StepProps) => {
  const {
    control,
    formState: { errors },
  } = useForm<RegistrationData>({
    defaultValues: formData,
    mode: 'onChange',
  })

  // Watch form values for real-time updates
  const watchedValues = useWatch({ control })

  // Update parent component when form values change
  useEffect(() => {
    if (watchedValues) {
      onUpdateData(watchedValues as RegistrationData)
    }
  }, [watchedValues, onUpdateData])

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
         Get Your Event Gallery
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
        Just one selfie — we'll find and send your best event moments.
      </Typography>

      <Box sx={{ maxWidth: { xs: 420, sm: 480, md: 520 } }}>
        <Box sx={{ space: 3 }}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Name"
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ fontSize: 20, color: '#8e8e93' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 1.5,
                  '& .MuiInputLabel-root': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#1d1d1f',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    fontSize: '0.75rem',
                    color: '#007aff',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#d2d2d7',
                    },
                    '&:hover fieldset': {
                      borderColor: '#8e8e93',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#007aff',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#1d1d1f',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    fontSize: '0.875rem',
                    opacity: 0.6,
                    color: '#8e8e93',
                  }
                }}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{ 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email Address"
                type="email"
                required
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ fontSize: 20, color: '#8e8e93' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 1.5,
                  '& .MuiInputLabel-root': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#1d1d1f',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    fontSize: '0.75rem',
                    color: '#007aff',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#d2d2d7',
                    },
                    '&:hover fieldset': {
                      borderColor: '#8e8e93',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#007aff',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#1d1d1f',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    fontSize: '0.875rem',
                    opacity: 0.6,
                    color: '#8e8e93',
                  }
                }}
              />
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Phone Number(Optional)"
                placeholder="555-555-1234"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ fontSize: 20, color: '#8e8e93' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 1.5,
                  '& .MuiInputLabel-root': {
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    color: '#8e8e93',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    fontSize: '0.75rem',
                    color: '#007aff',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#d2d2d7',
                    },
                    '&:hover fieldset': {
                      borderColor: '#8e8e93',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#007aff',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#1d1d1f',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    fontSize: '0.875rem',
                    opacity: 0.6,
                    color: '#8e8e93',
                  }
                }}
              />
            )}
          />

          <Controller
            name="instagram"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Instagram Handle(Optional)"
                placeholder="@alex.james"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaInstagram size={20} color="#8e8e93" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 1.5,
                  '& .MuiInputLabel-root': {
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    color: '#8e8e93',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    fontSize: '0.75rem',
                    color: '#007aff',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#d2d2d7',
                    },
                    '&:hover fieldset': {
                      borderColor: '#8e8e93',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#007aff',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#1d1d1f',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    fontSize: '0.875rem',
                    opacity: 0.6,
                    color: '#8e8e93',
                  }
                }}
              />
            )}
          />
        </Box>

        {/* Service Consent Component - now integrated with React Hook Form */}
        <Controller
          name="serviceConsent"
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <ServiceConsent
              checked={field.value || false}
              onChange={field.onChange}
              required={true}
            />
          )}
        />
      </Box>
    </Box>
  )
} 