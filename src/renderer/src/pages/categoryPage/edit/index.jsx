import {
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { SaveRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../productPage/components/PageLayout'
import { useEditCategory } from './hook/useEditCategory'

/* eslint-disable react/prop-types */
const SectionCard = ({ title, children }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        mb: 2.5
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Box>
  )
}

export const EditCategoryPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation()
  const isDark = theme.palette.mode === 'dark'
  const { form, handleChange, handleToggleAktif, handleSubmit, loading, saving, error } =
    useEditCategory()

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: theme.palette.custom.inputBg,
      borderRadius: 1.5,
      '& fieldset': { borderColor: theme.palette.custom.inputBorder },
      '&:hover fieldset': { borderColor: theme.palette.custom.inputBorderHover },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main }
    },
    '& .MuiInputBase-input': {
      color: 'text.primary',
      fontSize: 13,
      fontFamily: 'Poppins, sans-serif'
    },
    '& .MuiInputLabel-root': { color: 'text.disabled', fontSize: 13 },
    '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
    '& .MuiFormHelperText-root': {
      fontSize: 11,
      fontFamily: 'Poppins, sans-serif'
    }
  }

  const ghostBtn = {
    fontSize: 13,
    fontWeight: 500,
    textTransform: 'none',
    color: 'text.secondary',
    borderRadius: 2,
    px: 1.5,
    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)' }
  }

  const primaryBtn = {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 2,
    px: 2,
    bgcolor: 'primary.main',
    color: '#ffffff',
    boxShadow: 'none',
    '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' }
  }

  return (
    <PageLayout
      breadcrumbs={[
        { label: t('category.breadcrumb'), path: '/kategori/list' },
        { label: t('category.edit_title') }
      ]}
      title={t('category.edit_title')}
      actions={
        <>
          <Button size="medium" onClick={() => navigate('/kategori/list')} sx={ghostBtn}>
            {t('common.cancel')}
          </Button>
          <Button
            size="medium"
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={14} sx={{ color: 'inherit' }} />
              ) : (
                <SaveRounded sx={{ fontSize: 15 }} />
              )
            }
            onClick={handleSubmit}
            disabled={loading || saving}
            sx={primaryBtn}
          >
            {t('common.save_changes')}
          </Button>
        </>
      }
    >
      <Box sx={{ maxWidth: 600 }}>
        <SectionCard title={t('category.form_section')}>
          {loading ? (
            <Stack spacing={2.5}>
              <Skeleton variant="rounded" height={52} />
              <Skeleton variant="rounded" height={96} />
              <Skeleton variant="rounded" height={56} />
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              <TextField
                size="medium"
                label={t('category.col_name')}
                value={form.nama}
                onChange={handleChange('nama')}
                error={Boolean(error)}
                helperText={error || ' '}
                required
                autoFocus
                sx={inputSx}
              />
              <TextField
                size="medium"
                label={t('category.col_desc')}
                value={form.deskripsi}
                onChange={handleChange('deskripsi')}
                multiline
                minRows={3}
                placeholder={t('category.desc_placeholder')}
                sx={inputSx}
              />

              {/* ── Status toggle ────────────────────────────────────── */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'text.primary',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    {t('common.active')}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: 'text.disabled',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    {t('category.form_hint')}
                  </Typography>
                </Box>
                <Switch
                  checked={form.aktif}
                  onChange={handleToggleAktif}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: 'primary.main'
                    }
                  }}
                />
              </Box>
            </Stack>
          )}
        </SectionCard>
      </Box>
    </PageLayout>
  )
}
