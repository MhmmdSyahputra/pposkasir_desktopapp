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
import { useEditUnit } from './hook/useEditUnit'

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

export const EditUnitPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation()
  const isDark = theme.palette.mode === 'dark'
  const { form, handleChange, handleToggleAktif, handleSubmit, loading, saving, errors } =
    useEditUnit()

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
        { label: t('unit.breadcrumb'), path: '/satuan/list' },
        { label: t('unit.edit_title') }
      ]}
      title={t('unit.edit_title')}
      actions={
        <>
          <Button size="medium" onClick={() => navigate('/satuan/list')} sx={ghostBtn}>
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
        <SectionCard title={t('unit.form_section')}>
          {loading ? (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rounded" height={52} sx={{ flex: 8 }} />
                <Skeleton variant="rounded" height={52} sx={{ flex: 4 }} />
              </Stack>
              <Skeleton variant="rounded" height={96} />
              <Skeleton variant="rounded" height={56} />
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              {errors.general && (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: 'error.main',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  {errors.general}
                </Typography>
              )}

              {/* Nama (8) + Singkatan (4) */}
              <Stack direction="row" spacing={2}>
                <TextField
                  size="medium"
                  label={t('unit.col_name')}
                  value={form.nama}
                  onChange={handleChange('nama')}
                  error={Boolean(errors.nama)}
                  helperText={errors.nama || ' '}
                  required
                  autoFocus
                  sx={{ ...inputSx, flex: 8 }}
                />
                <TextField
                  size="medium"
                  label={t('unit.abbreviation')}
                  value={form.singkatan}
                  onChange={handleChange('singkatan')}
                  error={Boolean(errors.singkatan)}
                  helperText={errors.singkatan || ' '}
                  required
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  sx={{ ...inputSx, flex: 4 }}
                />
              </Stack>

              <TextField
                size="medium"
                label={t('category.col_desc')}
                value={form.deskripsi}
                onChange={handleChange('deskripsi')}
                multiline
                minRows={3}
                placeholder={t('unit.desc_placeholder')}
                sx={inputSx}
              />

              {/* ── Status toggle ──────────────────────────────────────── */}
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
                    {t('unit.form_hint')}
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
