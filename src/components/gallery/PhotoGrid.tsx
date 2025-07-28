import { useState, useMemo, useCallback, memo } from 'react'
import { Box, Card, CardMedia, useTheme, useMediaQuery, Skeleton } from '@mui/material'
import { GalleryPhoto } from '@/types'

interface PhotoGridProps {
  photos: GalleryPhoto[]
  onPhotoClick: (photoIndex: number) => void
}

export const PhotoGrid = memo(({ 
  photos, 
  onPhotoClick 
}: PhotoGridProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  
  // Instagram风格的响应式网格配置
  const gridConfig = useMemo(() => {
    // 优化列数：移动端2列，平板3列，桌面端4列
    const columnCount = isMobile ? 2 : isTablet ? 3 : 4
    
    // Instagram式紧密间距
    const gap = isMobile ? 2 : 3
    
    return {
      columnCount,
      gap
    }
  }, [isMobile, isTablet])

  return (
    <Box 
      sx={{ 
        width: '100%',
        mb: { xs: 2, sm: 2.5 }, // Harmonized with other components
        mt: { xs: 0.5, sm: 0.5 }, // Added subtle top margin
        display: 'grid',
        gridTemplateColumns: `repeat(${gridConfig.columnCount}, 1fr)`,
        gap: `${gridConfig.gap}px`,
        // Instagram风格的容器
        backgroundColor: 'transparent',
        // 性能优化
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        // 移动端优化
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {photos.map((photo, index) => (
        <InstagramPhotoCard
          key={photo.id}
          photo={photo}
          photoIndex={index}
          onPhotoClick={onPhotoClick}
        />
      ))}
    </Box>
  )
})

// Instagram风格的PhotoCard组件
interface PhotoCardProps {
  photo: GalleryPhoto
  photoIndex: number
  onPhotoClick: (photoIndex: number) => void
}

const InstagramPhotoCard = memo(({
  photo,
  photoIndex,
  onPhotoClick
}: PhotoCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handlePhotoClick = useCallback(() => {
    onPhotoClick(photoIndex)
  }, [onPhotoClick, photoIndex])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(true)
  }, [])

  // Instagram风格的卡片样式
  const cardStyles = useMemo(() => ({
    aspectRatio: '1 / 1', // Instagram经典正方形
    position: 'relative' as const,
    overflow: 'hidden',
    borderRadius: 0, // Instagram无圆角
    cursor: 'pointer',
    backgroundColor: '#f8f9fa', // 更柔和的背景色
    border: 'none',
    boxShadow: 'none', // Instagram简洁无阴影
    // Instagram风格的微妙交互
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: isMobile ? 'none' : 'scale(1.01)', // 移动端不缩放
      filter: 'brightness(0.95)', // Instagram风格的hover效果
      zIndex: 1,
    },
    '&:active': {
      transform: 'scale(0.98)',
      transition: 'all 0.1s ease-out',
    },
    // 性能优化
    willChange: 'transform',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
  }), [isMobile])

  // Instagram风格的图片样式
  const imageStyles = useMemo(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    // Instagram智能裁切：人像偏上，风景居中
    objectPosition: (photo.width && photo.height && photo.width > photo.height) ? 'center center' : 'center 30%',
    display: 'block',
    transition: imageLoaded ? 'opacity 0.2s ease-out' : 'none',
    opacity: imageLoaded ? 1 : 0,
    // 移动端触控优化
    WebkitTouchCallout: 'default', // 允许长按保存
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitUserDrag: 'none',
    // Instagram风格的图片处理
    filter: 'contrast(1.02) saturate(1.05)', // 轻微增强对比度和饱和度
  }), [imageLoaded, photo.width, photo.height])

  return (
    <Card
      sx={cardStyles}
      onClick={handlePhotoClick}
      elevation={0} // Instagram无阴影
    >
      {/* Instagram风格的加载动画 */}
      {!imageLoaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: '#e9ecef',
            '&::after': {
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            }
          }}
        />
      )}
      
      {/* 主图片 */}
      {!imageError && (
        <CardMedia
          component="img"
          sx={imageStyles}
          src={photo.downloadUrl || photo.thumbnailUrl}
          alt={photo.originalFilename}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          draggable={false}
        />
      )}

      {/* 错误状态 - Instagram风格 */}
      {imageError && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            color: '#6c757d',
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            fontWeight: 400,
            gap: 1,
          }}
        >
          <Box sx={{ fontSize: '1.5rem', opacity: 0.5 }}>📷</Box>
          <Box>Unable to load</Box>
        </Box>
      )}
      
      
      {/* Instagram风格的hover overlay - 非常微妙 */}
      {!isMobile && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.05)',
            opacity: 0,
            transition: 'opacity 0.15s ease-out',
            pointerEvents: 'none',
            '.MuiCard-root:hover &': {
              opacity: 1,
            },
          }}
        />
      )}
    </Card>
  )
})

PhotoGrid.displayName = 'PhotoGrid'
InstagramPhotoCard.displayName = 'InstagramPhotoCard' 