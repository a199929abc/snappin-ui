export interface RegistrationData {
  name: string,   
  email: string
  phone?: string
  instagram?: string
  photo?: File
  serviceConsent?: boolean
  emailVerified?: boolean
}

export interface StepProps {
  formData: RegistrationData
  onUpdateData: (data: Partial<RegistrationData>) => void
  onNext: () => void
  onBack?: () => void
}

export interface RegistrationState {
  currentStep: number
  formData: RegistrationData
  isSubmitting: boolean
  errors: Record<string, string>
} 