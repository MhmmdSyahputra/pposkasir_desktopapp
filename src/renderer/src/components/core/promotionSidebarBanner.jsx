import React, { useEffect, useState } from 'react'
import { Box, Typography, Tooltip, IconButton, useTheme, alpha } from '@mui/material'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import { promotionService } from '../../services/promotionService'

export const PromotionSidebarBanner = ({ collapsed }) => {
  const theme = useTheme()
  const [banners, setBanners] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const data = await promotionService.getBanners()
        if (data && data.length > 0) {
          setBanners(data)
        }
      } catch (error) {
        console.error('Failed to load banner for sidebar:', error)
      }
    }
    fetchBanner()
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 6000) // Rotate every 6 seconds

    return () => clearInterval(interval)
  }, [banners])

  if (banners.length === 0) return null
  const banner = banners[currentIndex]

  const handleClick = () => {
    if (banner.link_banner) {
      window.open(banner.link_banner, '_blank')
    }
  }

  if (collapsed) {
    return (
      <Tooltip title={banner.title_banner} placement="right">
        <IconButton
          onClick={handleClick}
          sx={{
            mb: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.2)
            }
          }}
        >
          <CardGiftcardIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )
  }

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: '90%',
        mb: 1.5,
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
        }
      }}
    >
      {banner.image && (
        <Box
          sx={{
            width: '100%',
            aspectRatio: '2.35 / 1',
            height: 'auto',
            backgroundImage: `url(${banner.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}
      <Box sx={{ p: 1.2 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'Poppins, sans-serif',
            color: theme.palette.primary.main,
            lineHeight: 1.2,
            mb: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {banner.title_banner}
        </Typography>
        <Typography
          sx={{
            fontSize: 9,
            color: 'text.secondary',
            fontFamily: 'Poppins, sans-serif',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {banner.description_banner}
        </Typography>
      </Box>
    </Box>
  )
}
