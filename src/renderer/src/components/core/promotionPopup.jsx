import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Button,
  Box,
  useTheme,
  alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { promotionService } from '../../services/promotionService';

export const PromotionPopup = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const checkAndShowPromotion = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const lastShownDate = localStorage.getItem('lastPromotionShownDate');

        // Only show once per day
        if (lastShownDate === today) {
          return;
        }

        const banners = await promotionService.getBanners();
        if (banners && banners.length > 0) {
          // Get the highest priority banner (first item in the sorted list)
          setBanner(banners[0]);
          setOpen(true);
          localStorage.setItem('lastPromotionShownDate', today);
        }
      } catch (error) {
        console.error('Failed to load promotion:', error);
      }
    };

    checkAndShowPromotion();
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleAction = () => {
    if (banner && banner.link_banner) {
      window.open(banner.link_banner, '_blank');
    }
    setOpen(false);
  };

  if (!banner) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
            theme.palette.background.paper,
            1
          )} 100%)`
        }
      }}
    >
      {/* Banner Image */}
      {banner.image && (
        <Box
          sx={{
            width: '100%',
            height: 220,
            backgroundImage: `url(${banner.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative'
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.4)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
              width: 32,
              height: 32
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Without image fallback */}
      {!banner.image && (
        <DialogTitle sx={{ pr: 6, pb: 1, pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
            {banner.title_banner}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}

      <DialogContent sx={{ px: 4, py: 3 }}>
        {banner.image && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontFamily: 'Poppins, sans-serif',
              mb: 1.5,
              color: 'text.primary'
            }}
          >
            {banner.title_banner}
          </Typography>
        )}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontFamily: 'Poppins, sans-serif',
            lineHeight: 1.6,
            fontSize: '0.95rem'
          }}
        >
          {banner.description_banner}
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: 'text.secondary',
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'none',
              fontWeight: 500,
              px: 3
            }}
          >
            Nanti Saja
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAction}
            endIcon={<OpenInNewIcon fontSize="small" />}
            sx={{
              borderRadius: 2,
              px: 3,
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            Lihat Detail
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
