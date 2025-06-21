import { Box, Typography } from '@mui/material'

interface GalleryHeaderProps {
  userName: string
}

export const GalleryHeader = ({ userName }: GalleryHeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pb: 2,
        borderBottom: '1px solid #e0e0e0',
        mb: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          fontSize: '1.25rem',
          color: 'text.primary',
        }}
      >
        {userName}'s Gallery
      </Typography>
    </Box>
  )
} 