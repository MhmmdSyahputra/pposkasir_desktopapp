import { Box, Breadcrumbs, Link, Typography, useTheme } from '@mui/material'
import { NavigateNextRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

/**
 * Base page layout used by all product CRUD pages.
 *
 * Props:
 *   breadcrumbs  – [{ label, path? }]  last item has no path (current page)
 *   title        – page heading string
 *   actions      – ReactNode rendered on the right side of the header
 *   children     – scrollable page content
 */
// eslint-disable-next-line react/prop-types
export const PageLayout = ({ breadcrumbs = [], title, actions, children }) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      {/* ── Page header ────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          flexShrink: 0,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextRounded sx={{ fontSize: 14, color: 'text.disabled' }} />}
            sx={{ mb: 1.5 }}
          >
            {breadcrumbs.map((crumb, i) =>
              crumb.path ? (
                <Link
                  key={i}
                  component="button"
                  underline="hover"
                  onClick={() => navigate(crumb.path)}
                  sx={{
                    color: 'text.secondary',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: 'none',
                    border: 0,
                    p: 0,
                    transition: 'color 150ms',
                    '&:hover': { color: 'text.primary' }
                  }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <Typography
                  key={i}
                  sx={{
                    color: 'primary.main',
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'inherit'
                  }}
                >
                  {crumb.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              fontSize: 18,
              fontFamily: 'inherit',
              lineHeight: 1.3
            }}
          >
            {title}
          </Typography>

          {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{actions}</Box>}
        </Box>
      </Box>

      {/* ── Scrollable content ─────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 3,
          py: 2.5,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
            borderRadius: 3,
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)' }
          }
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
