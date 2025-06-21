import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { Download, Share, CheckCircle } from '@mui/icons-material'

interface ActionButtonsProps {
  selectedCount: number
  totalCount: number
  isDownloading: boolean
  onDownload: () => void
  onShare: () => void
  onSelectAll: () => void
  onDeselectAll: () => void
}

export const ActionButtons = ({
  selectedCount,
  totalCount,
  isDownloading,
  onDownload,
  onShare,
  onSelectAll,
  onDeselectAll,
}: ActionButtonsProps) => {
  const hasSelection = selectedCount > 0
  const allSelected = selectedCount === totalCount

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        px: { xs: 3, sm: 4 },
        pt: 2,
        pb: { xs: 2.5, sm: 2 }, // Reduced since no privacy notice
        zIndex: 1000,
        boxShadow: '0 -2px 12px rgba(59, 42, 42, 0.08)',
      }}
    >
      {/* Selection status and controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {selectedCount > 0 
            ? `${selectedCount} of ${totalCount} selected`
            : `${totalCount} photos available`
          }
        </Typography>
        
        <Button
          variant="text"
          size="small"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
            color: 'primary.main',
            minWidth: 'auto',
            px: 1,
            py: 0.5,
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
          }}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </Button>
      </Box>

      {/* Action buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
        }}
      >
        {/* Share button */}
        <Button
          variant="outlined"
          startIcon={<Share sx={{ fontSize: 18 }} />}
          onClick={onShare}
          disabled={!hasSelection || isDownloading}
          sx={{
            flex: 1,
            height: 48, // Standard mobile button height
            fontSize: '0.95rem',
            fontWeight: 600,
            borderRadius: 3,
            textTransform: 'none',
            borderColor: hasSelection ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.12)',
            color: hasSelection ? 'text.primary' : 'text.disabled',
            backgroundColor: 'transparent',
            '&:hover': {
              borderColor: hasSelection ? 'primary.main' : 'rgba(0, 0, 0, 0.12)',
              backgroundColor: hasSelection ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
            },
            '&:disabled': {
              borderColor: 'rgba(0, 0, 0, 0.12)',
              color: 'text.disabled',
            },
          }}
        >
          Share
        </Button>

        {/* Download button */}
        <Button
          variant="contained"
          startIcon={
            isDownloading ? (
              <CircularProgress size={18} sx={{ color: 'white' }} />
            ) : (
              <Download sx={{ fontSize: 18 }} />
            )
          }
          onClick={onDownload}
          disabled={!hasSelection || isDownloading}
          sx={{
            flex: 2,
            height: 48, // Standard mobile button height
            fontSize: '0.95rem',
            fontWeight: 700,
            borderRadius: 3,
            textTransform: 'none',
            backgroundColor: hasSelection ? 'primary.main' : 'rgba(0, 0, 0, 0.12)',
            color: hasSelection ? 'white' : 'rgba(0, 0, 0, 0.38)',
            boxShadow: hasSelection ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none',
            '&:hover': {
              backgroundColor: hasSelection ? 'primary.dark' : 'rgba(0, 0, 0, 0.12)',
              boxShadow: hasSelection ? '0 4px 12px rgba(25, 118, 210, 0.4)' : 'none',
            },
            '&:disabled': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.38)',
              boxShadow: 'none',
            },
            '&:active': {
              transform: hasSelection ? 'scale(0.98)' : 'none',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {isDownloading
            ? 'Downloading...'
            : hasSelection
            ? selectedCount === 1 
              ? 'Download' 
              : `Download (${selectedCount})`
            : 'Select photos'
          }
        </Button>
      </Box>
    </Box>
  )
} 