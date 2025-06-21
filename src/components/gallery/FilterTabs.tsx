import { Box, Button } from '@mui/material'
import { GalleryFilter } from '@/types'

interface FilterTabsProps {
  activeFilter: GalleryFilter
  onFilterChange: (filter: GalleryFilter) => void
}

const filterLabels: Record<GalleryFilter, string> = {
  all: 'All',
  enhanced: 'Enhanced',
  favorites: 'Favorites',
}

export const FilterTabs = ({ activeFilter, onFilterChange }: FilterTabsProps) => {
  const filters: GalleryFilter[] = ['all', 'enhanced', 'favorites']

  return (
    <Box
      sx={{
        display: 'flex',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        mb: { xs: 2, sm: 2.5 }, // Increased for harmonious spacing
        mt: { xs: 0.5, sm: 0.75 }, // Added top margin for better separation
        gap: 0,
      }}
    >
      {filters.map((filter) => (
        <Button
          key={filter}
          onClick={() => onFilterChange(filter)}
          sx={{
            fontSize: '0.95rem',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            minWidth: 'auto',
            borderRadius: 0,
            textTransform: 'none',
            color: activeFilter === filter ? 'primary.main' : 'text.secondary',
            backgroundColor: 'transparent',
            position: 'relative',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: activeFilter === filter ? 'primary.main' : 'transparent',
              transition: 'background-color 0.2s ease-in-out',
            },
          }}
        >
          {filterLabels[filter]}
        </Button>
      ))}
    </Box>
  )
} 