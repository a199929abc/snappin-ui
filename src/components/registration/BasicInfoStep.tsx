import { useForm, Controller, useWatch } from 'react-hook-form'
import { useEffect } from 'react'
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  InputAdornment,
} from '@mui/material'
import { Phone, Email, Person } from '@mui/icons-material'
import { FaInstagram } from 'react-icons/fa'
import { StepProps, RegistrationData } from '@/types/registration'
import { ServiceConsent } from './ServiceConsent'

const countryCodes = [
  { code: '+1', country: 'US' },
  { code: '+44', country: 'UK' },
  { code: '+33', country: 'FR' },
  { code: '+49', country: 'DE' },
  { code: '+86', country: 'CN' },
]

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
          mb: { xs: 1.5, sm: 2, md: 2.5 },
          textAlign: 'left',
          color: 'text.primary',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
        }}
      >
        Registration
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
        Register to receive your personalized event gallery.
      </Typography>

      <Box sx={{ maxWidth: { xs: 360, sm: 400, md: 440 } }}>
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
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: { xs: 1.5, sm: 2 } }}
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
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: { xs: 1.5, sm: 2 } }}
              />
            )}
          />

          <Box sx={{ display: 'flex', gap: 1, mb: { xs: 1.5, sm: 2 } }}>
            <TextField
              select
              label="Code"
              defaultValue="+1"
              sx={{ width: { xs: 90, sm: 100 } }}
            >
              {countryCodes.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.code}
                </MenuItem>
              ))}
            </TextField>

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Phone Number (Optional)"
                  placeholder="555 555-1234"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>

          <Controller
            name="instagram"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Instagram Handle (optional)"
                placeholder="e.g. @alex.james"
                helperText="We'll tag you if we share your photo (with consent)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaInstagram color="#E4405F" size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: { xs: 1.5, sm: 2 } }}
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