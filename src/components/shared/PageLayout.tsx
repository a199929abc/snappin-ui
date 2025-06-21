import React from 'react'
import { Box, Container, ThemeProvider, createTheme, CircularProgress } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#666',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", "Poppins", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
})

interface PageLayoutProps {
  children: React.ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showHeader?: boolean
  headerContent?: React.ReactNode
  showBottomActions?: boolean
  bottomActionsContent?: React.ReactNode
  isLoading?: boolean
  loadingText?: string
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  maxWidth = 'lg',
  showHeader = true,
  headerContent,
  showBottomActions = false,
  bottomActionsContent,
  isLoading = false,
  loadingText
}) => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fafafa',
        }}
      >
        {/* Header */}
        {showHeader && (
          <Box sx={{ 
            textAlign: 'left', 
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 2, sm: 3 }
          }}>
            <Container maxWidth={maxWidth}>
              {headerContent || (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    ml: { xs: 1, sm: 1.5, md: 2 },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 28, sm: 32, md: 36 },
                      height: { xs: 28, sm: 32, md: 36 },
                      borderRadius: 1,
                      backgroundColor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
                      }}
                    >
                      S
                    </Box>
                  </Box>
                  <Box
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.75rem' },
                      margin: 0,
                    }}
                  >
                    {import.meta.env.VITE_APP_NAME || 'SNAPPIN'}
                  </Box>
                </Box>
              )}
            </Container>
          </Box>
        )}

        {/* Scrollable Content Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Container 
            maxWidth={maxWidth} 
            sx={{ 
              py: { xs: 2, sm: 3, md: 4 },
              px: { xs: 2, sm: 3 },
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Container>
        </Box>

        {/* Bottom Actions Area */}
        {showBottomActions && bottomActionsContent && (
          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: 'rgba(250, 250, 250, 0.95)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(224, 224, 224, 0.8)',
              py: { xs: 2, sm: 2.5, md: 3 },
              zIndex: 100,
              marginTop: 'auto',
              boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.05)',
            }}
          >
            {bottomActionsContent}
          </Box>
        )}
      </Box>

      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.3)', // 很淡的背景防止误操作
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            gap: 2,
          }}
        >
          <CircularProgress 
            size={100} 
            thickness={4}
            color="primary"
          />
          {loadingText && (
            <Box
              sx={{
                color: 'text.primary',
                fontSize: '0.875rem',
                fontWeight: 500,
                mt: 1,
              }}
            >
              {loadingText}
            </Box>
          )}
        </Box>
      )}
    </ThemeProvider>
  )
} 