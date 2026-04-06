import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material'
import {
  AddRounded,
  DeleteRounded,
  RadioButtonCheckedRounded,
  CheckBoxRounded,
  SaveRounded
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../productPage/components/PageLayout'
import { useCreateModifier } from './hook/useCreateModifier'

// eslint-disable-next-line react/prop-types
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

export const CreateModifierPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation()
  const isDark = theme.palette.mode === 'dark'
  const {
    form,
    handleChange,
    handleToggleWajib,
    handleToggleAktif,
    options,
    addOption,
    removeOption,
    updateOption,
    saving,
    errors,
    handleSubmit
  } = useCreateModifier()

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
      color: 'text.disabled',
      fontSize: 11,
      fontFamily: 'Poppins, sans-serif'
    }
  }

  const menuPaperSx = {
    PaperProps: {
      sx: {
        bgcolor: isDark ? '#1a1f2c' : '#ffffff',
        border: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
        '& .MuiMenuItem-root': {
          fontSize: 13,
          fontFamily: 'Poppins, sans-serif',
          '&:hover': { bgcolor: `${theme.palette.primary.main}14` },
          '&.Mui-selected': { bgcolor: `${theme.palette.primary.main}1f`, color: 'primary.main' }
        }
      }
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
        { label: t('modifier.breadcrumb'), path: '/modifier/list' },
        { label: t('modifier.add') }
      ]}
      title={t('modifier.add')}
      actions={
        <>
          <Button size="medium" onClick={() => navigate('/modifier/list')} sx={ghostBtn}>
            {t('common.cancel')}
          </Button>
          <Button
            size="medium"
            variant="contained"
            startIcon={saving ? null : <SaveRounded sx={{ fontSize: 15 }} />}
            onClick={handleSubmit}
            disabled={saving}
            sx={primaryBtn}
          >
            {saving ? <CircularProgress size={16} color="inherit" /> : t('common.save')}
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* ── LEFT: main form ────────────────────────────────────────── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SectionCard title={t('modifier.form_section')}>
            {/* Nama */}
            <TextField
              label={t('modifier.col_name')}
              size="medium"
              fullWidth
              required
              value={form.nama}
              onChange={handleChange('nama')}
              error={Boolean(errors.nama)}
              helperText={errors.nama || ' '}
              placeholder={t('modifier.name_placeholder')}
              sx={{ ...inputSx, mb: 1 }}
            />

            {/* Tipe pilih */}
            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: 12,
                fontFamily: 'Poppins, sans-serif',
                mb: 1
              }}
            >
              {t('modifier.type_label')}
            </Typography>
            <ToggleButtonGroup
              value={form.tipe}
              exclusive
              onChange={(_e, val) => {
                if (val) handleChange('tipe')({ target: { value: val } })
              }}
              size="small"
              sx={{
                mb: 2,
                '& .MuiToggleButton-root': {
                  fontSize: 12,
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'none',
                  px: 2,
                  borderColor: theme.palette.divider,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    bgcolor: `${theme.palette.primary.main}1f`,
                    color: 'primary.main',
                    borderColor: theme.palette.primary.main
                  }
                }
              }}
            >
              <ToggleButton value="single">
                <RadioButtonCheckedRounded sx={{ fontSize: 15, mr: 0.75 }} />
                {t('modifier.type_radio')}
              </ToggleButton>
              <ToggleButton value="multiple">
                <CheckBoxRounded sx={{ fontSize: 15, mr: 0.75 }} />
                {t('modifier.type_checkbox')}
              </ToggleButton>
            </ToggleButtonGroup>

            {form.tipe === 'multiple' && (
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <FormControl size="medium" sx={{ ...inputSx, flex: 1 }}>
                  <InputLabel>{t('modifier.min_select')}</InputLabel>
                  <Select
                    label={t('modifier.min_select')}
                    value={form.min_pilih}
                    onChange={handleChange('min_pilih')}
                    MenuProps={menuPaperSx}
                    sx={{
                      fontSize: 13,
                      fontFamily: 'Poppins, sans-serif',
                      color: 'text.primary'
                    }}
                  >
                    {[0, 1, 2, 3].map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="medium" sx={{ ...inputSx, flex: 1 }}>
                  <InputLabel>{t('modifier.max_select')}</InputLabel>
                  <Select
                    label={t('modifier.max_select')}
                    value={form.max_pilih}
                    onChange={handleChange('max_pilih')}
                    MenuProps={menuPaperSx}
                    sx={{
                      fontSize: 13,
                      fontFamily: 'Poppins, sans-serif',
                      color: 'text.primary'
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            )}

            {errors.general && (
              <Typography
                sx={{ color: 'error.main', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}
              >
                {errors.general}
              </Typography>
            )}
          </SectionCard>

          {/* ── Options list ─────────────────────────────────────────── */}
          <SectionCard
            title={`${t('modifier.options_list')} (${options.filter((o) => o.nama.trim()).length})`}
          >
            {errors.options && (
              <Typography
                sx={{
                  color: 'error.main',
                  fontSize: 12,
                  mb: 2,
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                {errors.options}
              </Typography>
            )}

            <Stack spacing={1.5}>
              {options.map((opt, idx) => (
                <Box key={opt._key} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {/* Index */}
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: 'text.disabled',
                      fontFamily: 'Poppins, sans-serif',
                      width: 20,
                      flexShrink: 0,
                      textAlign: 'right'
                    }}
                  >
                    {idx + 1}.
                  </Typography>

                  {/* Emoji */}
                  <TextField
                    size="small"
                    placeholder="🌶"
                    value={opt.emoji}
                    onChange={(e) => updateOption(opt._key, 'emoji', e.target.value)}
                    inputProps={{ maxLength: 4 }}
                    sx={{
                      ...inputSx,
                      width: 64,
                      '& input': { textAlign: 'center', fontSize: 16, fontFamily: 'inherit', px: 1 }
                    }}
                  />

                  {/* Nama opsi */}
                  <TextField
                    size="small"
                    placeholder={t('modifier.option_name')}
                    value={opt.nama}
                    onChange={(e) => updateOption(opt._key, 'nama', e.target.value)}
                    sx={{ ...inputSx, flex: 1 }}
                  />

                  {/* Harga tambah */}
                  <TextField
                    size="small"
                    placeholder="0"
                    value={opt.harga_tambah}
                    onChange={(e) => updateOption(opt._key, 'harga_tambah', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography
                            sx={{ color: 'text.secondary', fontSize: 12, fontFamily: 'inherit' }}
                          >
                            +Rp
                          </Typography>
                        </InputAdornment>
                      )
                    }}
                    sx={{ ...inputSx, width: 130 }}
                  />

                  {/* Remove */}
                  <Tooltip title={t('modifier.delete_option')}>
                    <span>
                      <IconButton
                        size="small"
                        disabled={options.length === 1}
                        onClick={() => removeOption(opt._key)}
                        sx={{
                          color: 'text.disabled',
                          '&:hover': { color: 'error.main' },
                          '&.Mui-disabled': { opacity: 0.3 }
                        }}
                      >
                        <DeleteRounded fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

            <Button
              size="small"
              startIcon={<AddRounded sx={{ fontSize: 15 }} />}
              onClick={addOption}
              disabled={options.length >= 20}
              sx={{
                fontSize: 12,
                textTransform: 'none',
                color: 'primary.main',
                borderRadius: 1.5,
                px: 1.5,
                bgcolor: `${theme.palette.primary.main}0d`,
                '&:hover': { bgcolor: `${theme.palette.primary.main}1a` }
              }}
            >
              {t('modifier.add_option')}
            </Button>
          </SectionCard>
        </Box>

        {/* ── RIGHT: settings ───────────────────────────────────────── */}
        <Box sx={{ width: 240, flexShrink: 0 }}>
          <SectionCard title={t('modifier.settings_section')}>
            {/* Wajib */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontSize: 13,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600
                  }}
                >
                  {form.wajib ? t('modifier.required_label') : t('pos.optional')}
                </Typography>
                <Typography
                  sx={{
                    color: 'text.disabled',
                    fontSize: 11,
                    fontFamily: 'Poppins, sans-serif',
                    mt: 0.3
                  }}
                >
                  {form.wajib ? t('modifier.required_true') : t('modifier.required_false')}
                </Typography>
              </Box>
              <Switch
                checked={form.wajib}
                onChange={handleToggleWajib}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: 'error.main' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: 'error.main'
                  }
                }}
              />
            </Box>

            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                bgcolor: form.wajib
                  ? 'rgba(211,47,47,0.08)'
                  : alpha(theme.palette.text.disabled, 0.06),
                border: `1px solid ${form.wajib ? 'rgba(211,47,47,0.3)' : theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: form.wajib ? 'error.main' : 'text.disabled',
                  flexShrink: 0
                }}
              />
              <Typography
                sx={{
                  color: form.wajib ? 'error.main' : 'text.disabled',
                  fontSize: 11,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600
                }}
              >
                {form.wajib ? t('modifier.col_required') : t('pos.optional')}
              </Typography>
            </Box>

            {/* Aktif */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontSize: 13,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600
                  }}
                >
                  {form.aktif ? t('modifier.visible_true') : t('modifier.visible_false')}
                </Typography>
                <Typography
                  sx={{
                    color: 'text.disabled',
                    fontSize: 11,
                    fontFamily: 'Poppins, sans-serif',
                    mt: 0.3
                  }}
                >
                  {form.aktif ? t('product.status_active_desc') : t('product.status_inactive_desc')}
                </Typography>
              </Box>
              <Switch
                checked={form.aktif}
                onChange={handleToggleAktif}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: theme.palette.primary.main },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: theme.palette.primary.main
                  }
                }}
              />
            </Box>

            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                bgcolor: form.aktif
                  ? alpha(theme.palette.success?.main ?? '#4caf50', 0.1)
                  : alpha(theme.palette.text.disabled, 0.08),
                border: `1px solid ${form.aktif ? alpha(theme.palette.success?.main ?? '#4caf50', 0.3) : theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: form.aktif
                    ? (theme.palette.success?.main ?? '#4caf50')
                    : 'text.disabled',
                  flexShrink: 0
                }}
              />
              <Typography
                sx={{
                  color: form.aktif ? (theme.palette.success?.main ?? '#4caf50') : 'text.disabled',
                  fontSize: 11,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600
                }}
              >
                {form.aktif ? t('common.active') : t('common.inactive')}
              </Typography>
            </Box>
          </SectionCard>
        </Box>
      </Box>
    </PageLayout>
  )
}
