import { Box, Step, StepConnector, StepLabel, Stepper } from '@mui/material'
import { styled } from '@mui/material/styles'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    height: 2,
    border: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
    marginLeft: '2px',
    marginRight: '2px',
  },
  '&.MuiStepConnector-active .MuiStepConnector-line': {
    backgroundColor: '#1976d2',
  },
  '&.MuiStepConnector-completed .MuiStepConnector-line': {
    backgroundColor: '#1976d2',
  },
}))

const CustomStepIcon = styled('div')<{ active?: boolean; completed?: boolean }>(
  ({ theme, active, completed }) => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: active || completed ? '#1976d2' : '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8px',
    fontWeight: 600,
    color: active || completed ? '#fff' : '#999',
    transition: 'all 0.2s ease-in-out',
  })
)

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <Box sx={{ 
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
      mb: { xs: 2, sm: 3, md: 4 }
    }}>
      <Stepper
        activeStep={currentStep - 1}
        connector={<CustomStepConnector />}
        sx={{ 
          minWidth: '200px',
          maxWidth: '300px',
          '& .MuiStep-root': {
            padding: 0,
          },
          '& .MuiStepLabel-root': {
            padding: '0 12px',
          }
        }}
      >
        {steps.map((step) => (
          <Step key={step}>
            <StepLabel
              StepIconComponent={() => (
                <CustomStepIcon
                  active={step === currentStep}
                  completed={step < currentStep}
                />
              )}
            />
          </Step>
        ))}
      </Stepper>
    </Box>
  )
} 