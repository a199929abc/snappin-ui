import { Modal, Box, Typography, IconButton, Paper } from '@mui/material'
import { Close } from '@mui/icons-material'

interface PrivacyModalProps {
  open: boolean
  onClose: () => void
}

export const PrivacyModal = ({ open, onClose }: PrivacyModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, sm: 2 }
      }}
    >
      <Paper sx={{
        width: '100%',
        maxWidth: { xs: '95%', sm: '480px', md: '520px' },
        maxHeight: { xs: '90vh', sm: '80vh' },
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: { xs: 0, sm: 2 }
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50'
        }}>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Privacy Policy
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 3 
        }}>
          <Typography variant="body2" paragraph color="text.secondary" sx={{ lineHeight: 1.6 }}>
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h6" gutterBottom color="text.primary" sx={{ mt: 2 }}>
            How We Use Your Information
          </Typography>
          <Typography variant="body2" paragraph color="text.secondary" sx={{ lineHeight: 1.6 }}>
            We use face recognition technology to automatically identify you in event photos. 
            This service helps you quickly find photos where you appear at events.
          </Typography>

          <Typography variant="h6" gutterBottom color="text.primary" sx={{ mt: 2 }}>
            Data We Collect
          </Typography>
          <Typography variant="body2" paragraph color="text.secondary" sx={{ lineHeight: 1.6 }}>
            • Your name and email address for account identification<br/>
            • Your photo for face recognition processing<br/>
            • Optional contact information (phone, social media)
          </Typography>

          <Typography variant="h6" gutterBottom color="text.primary" sx={{ mt: 2 }}>
            Data Security
          </Typography>
          <Typography variant="body2" paragraph color="text.secondary" sx={{ lineHeight: 1.6 }}>
            We use industry-standard encryption to protect your personal information. 
            Your face data is processed using secure AI models and is never shared with third parties.
          </Typography>

          <Typography variant="h6" gutterBottom color="text.primary" sx={{ mt: 2 }}>
            Your Rights
          </Typography>
          <Typography variant="body2" paragraph color="text.secondary" sx={{ lineHeight: 1.6 }}>
            You have the right to:<br/>
            • Access your personal data<br/>
            • Delete your account and all associated data<br/>
            • Withdraw consent at any time<br/>
            • Contact us with privacy concerns
          </Typography>

          <Typography variant="h6" gutterBottom color="text.primary" sx={{ mt: 2 }}>
            Contact Us
          </Typography>
          <Typography variant="body2" paragraph color="text.secondary" sx={{ lineHeight: 1.6 }}>
            For privacy-related questions or to exercise your rights, please contact us at:
            <br/>
            <strong>privacy@snappin.ca</strong>
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            This is a simplified privacy policy for demonstration. 
            A complete policy would include additional legal requirements and details.
          </Typography>
        </Box>
      </Paper>
    </Modal>
  )
} 