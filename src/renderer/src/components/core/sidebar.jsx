/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Avatar,
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material'
import {
  HomeRounded,
  SettingsRounded,
  LogoutRounded,
  PointOfSaleRounded,
  ChevronRightRounded,
  ChevronLeftRounded,
  ExpandMoreRounded,
  FiberManualRecord
} from '@mui/icons-material'
import { useAuth } from '../../context/authContext'
import { useNotifier } from './notificationProvider'

// ── sub-menu popover shown when sidebar is collapsed ─────────────────────
const CollapsedSubMenu = ({ anchorEl, open, item, onClose, onOpen, navItemSx, theme }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="right-start"
      modifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}
      sx={{ zIndex: 1400 }}
    >
      <Paper
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
        elevation={4}
        sx={{
          minWidth: 180,
          py: 0.75,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          borderRadius: 2
        }}
      >
        <Typography
          sx={{
            px: 2,
            pb: 0.5,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.disabled',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {t(item.labelKey || item.label)}
        </Typography>
        {}
        {item.children.map((child) => {
          const ChildIcon = child.icon ?? HomeRounded
          const selected = location.pathname === child.path
          return (
            <ListItemButton
              key={child.path}
              selected={selected}
              onClick={() => {
                navigate(child.path)
                onClose()
              }}
              sx={{
                ...navItemSx,
                mx: 0.75,
                mb: 0.25,
                borderRadius: 1.5,
                justifyContent: 'flex-start',
                px: 1.25
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                <ChildIcon sx={{ fontSize: 11 }} />
              </ListItemIcon>
              <ListItemText
                primary={t(child.labelKey || child.label)}
                primaryTypographyProps={{
                  fontSize: 13,
                  fontWeight: selected ? 700 : 500
                }}
              />
            </ListItemButton>
          )
        })}
      </Paper>
    </Popper>
  )
}

export const Sidebar = ({ routes = [] }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const {
    user,
    activeSession,
    refreshActiveSession,
    openCashierSession,
    closeCashierSession,
    logout
  } = useAuth()
  const { show } = useNotifier()
  const [collapsed, setCollapsed] = useState(true)
  const [openGroups, setOpenGroups] = useState({})
  const [hoveredGroup, setHoveredGroup] = useState(null)
  const [hoveredGroupEl, setHoveredGroupEl] = useState(null)
  const [openCashierDialog, setOpenCashierDialog] = useState(false)
  const [cashierNote, setCashierNote] = useState('')
  const [cashierAmount, setCashierAmount] = useState('')
  const [cashierLoading, setCashierLoading] = useState(false)
  const [cashierError, setCashierError] = useState('')
  const [closeSummary, setCloseSummary] = useState(null)
  const closeTimer = useRef(null)
  const theme = useTheme()

  const menuItems = routes.filter((r) => r.active)

  const navItemSx = {
    borderRadius: 3,
    minHeight: 48,
    mb: 0.75,
    justifyContent: collapsed ? 'center' : 'flex-start',
    px: collapsed ? 1 : 1.25,
    color: 'text.secondary',
    '& .MuiListItemIcon-root': {
      minWidth: collapsed ? 0 : 38,
      justifyContent: 'center'
    },
    '&.Mui-selected': {
      color: 'primary.main',
      bgcolor: `${theme.palette.primary.main}1a`
    },
    '&.Mui-selected:hover': {
      bgcolor: `${theme.palette.primary.main}29`
    },
    '&:hover': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
    }
  }

  const childItemSx = {
    ...navItemSx,
    minHeight: 40,
    mb: 0.25,
    borderRadius: 2,
    pl: 2
  }

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const openGroup = (label, el) => {
    clearTimeout(closeTimer.current)
    setHoveredGroup(label)
    setHoveredGroupEl(el)
  }
  const closeGroup = () => {
    closeTimer.current = setTimeout(() => {
      setHoveredGroup(null)
      setHoveredGroupEl(null)
    }, 60)
  }

  const isGroupActive = (item) => item.children?.some((c) => location.pathname.startsWith(c.path))
  const isSettingsRoute = location.pathname.startsWith('/settings')
  const isCashierOpen = Boolean(activeSession?.is_active)
  const settingsMenu = {
    label: 'Settings',
    labelKey: 'sidebar.settings',
    icon: SettingsRounded,
    children: [
      {
        path: '/settings',
        label: 'General Settings',
        labelKey: 'sidebar.settings_general',
        icon: FiberManualRecord,
        active: true
      },
      {
        path: '/settings/receipt',
        label: 'Receipt Settings',
        labelKey: 'sidebar.settings_receipt',
        icon: FiberManualRecord,
        active: true
      }
    ]
  }
  const settingsGroupOpen = openGroups.settings ?? isSettingsRoute

  useEffect(() => {
    if (!user?.username) return
    refreshActiveSession().catch(() => {
      // Ignore initial refresh errors and rely on explicit open/close actions feedback.
    })
  }, [refreshActiveSession, user?.username])

  const fmtRp = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(Number(n || 0))

  const initials = String(user?.username || 'PP')
    .slice(0, 2)
    .toUpperCase()

  const roleLabel = user?.role === 'super' ? t('sidebar.role_super') : t('sidebar.role_cashier')

  const handleOpenCashierDialog = () => {
    setCashierError('')
    setCloseSummary(null)
    setCashierAmount(isCashierOpen ? '' : String(activeSession?.opening_cash || ''))
    setCashierNote('')
    setOpenCashierDialog(true)
  }

  const handleSubmitCashierSession = async () => {
    setCashierError('')
    setCashierLoading(true)

    try {
      const amount = Number(String(cashierAmount).replace(/\D/g, '')) || 0
      if (!isCashierOpen) {
        await openCashierSession({ openingCash: amount, note: cashierNote })
        show({ message: t('sidebar.cashier_open_success'), severity: 'success' })
        setOpenCashierDialog(false)
      } else {
        const closed = await closeCashierSession({ closingCash: amount, note: cashierNote })
        setCloseSummary(closed)
        show({ message: t('sidebar.cashier_close_success'), severity: 'success' })
      }
    } catch (error) {
      setCashierError(error.message || t('sidebar.cashier_action_failed'))
    } finally {
      setCashierLoading(false)
    }
  }

  return (
    <Box
      sx={{
        width: collapsed ? 84 : 220,
        minWidth: collapsed ? 84 : 220,
        height: '100vh',
        bgcolor: 'background.paper',
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 0.75,
        px: collapsed ? 1 : 1.25,
        transition: 'width 240ms ease, min-width 240ms ease, padding 240ms ease'
      }}
    >
      <Tooltip
        title={collapsed ? t('sidebar.show_labels') : t('sidebar.hide_labels')}
        placement="right"
      >
        <IconButton
          size="small"
          onClick={() => setCollapsed((prev) => !prev)}
          sx={{
            alignSelf: collapsed ? 'center' : 'flex-end',
            color: 'text.secondary',
            mb: 1,
            transition: 'all 200ms ease'
          }}
        >
          {collapsed ? <ChevronRightRounded /> : <ChevronLeftRounded />}
        </IconButton>
      </Tooltip>

      <List sx={{ width: '100%', px: 0 }}>
        {menuItems.map((item) => {
          const Icon = item.icon ?? HomeRounded

          // ── item with children (group) ──────────────────────────────
          if (item.children) {
            const active = isGroupActive(item)
            const groupOpen = openGroups[item.label] ?? active

            return (
              <Box key={item.label}>
                {/* parent button */}
                <Tooltip
                  title={collapsed ? t(item.labelKey || item.label) : ''}
                  placement="right"
                  disableHoverListener={!collapsed}
                >
                  <ListItemButton
                    selected={active}
                    onClick={() => {
                      if (collapsed) return // handled by popper
                      toggleGroup(item.label)
                    }}
                    onMouseEnter={(e) => collapsed && openGroup(item.label, e.currentTarget)}
                    onMouseLeave={() => collapsed && closeGroup()}
                    sx={{
                      ...navItemSx,
                      justifyContent: collapsed ? 'center' : 'space-between'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: collapsed ? 0 : 1.5,
                        flex: 1,
                        minWidth: 0
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 0 }}>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      {!collapsed && (
                        <ListItemText
                          primary={t(item.labelKey || item.label)}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: active ? 700 : 500,
                            textTransform: 'capitalize',
                            noWrap: true
                          }}
                        />
                      )}
                    </Box>
                    {!collapsed && (
                      <ExpandMoreRounded
                        sx={{
                          fontSize: 18,
                          color: 'text.disabled',
                          flexShrink: 0,
                          transform: groupOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 200ms ease'
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>

                {/* collapsed → floating popper */}
                {collapsed && (
                  <CollapsedSubMenu
                    anchorEl={hoveredGroupEl}
                    open={hoveredGroup === item.label}
                    item={item}
                    onClose={closeGroup}
                    onOpen={() => clearTimeout(closeTimer.current)}
                    navItemSx={navItemSx}
                    theme={theme}
                  />
                )}

                {/* expanded → inline collapse */}
                {!collapsed && (
                  <Collapse in={groupOpen} timeout={160}>
                    <List disablePadding sx={{ pl: 1 }}>
                      {item.children
                        .filter((c) => c.active)
                        .map((child) => {
                          const ChildIcon = child.icon ?? HomeRounded
                          const selected = location.pathname === child.path
                          return (
                            <Tooltip
                              key={child.path}
                              title=""
                              placement="right"
                              disableHoverListener
                            >
                              <ListItemButton
                                selected={selected}
                                onClick={() => navigate(child.path)}
                                sx={childItemSx}
                              >
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                                  <ChildIcon sx={{ fontSize: 11 }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={t(child.labelKey || child.label)}
                                  primaryTypographyProps={{
                                    fontSize: 13,
                                    fontWeight: selected ? 700 : 500
                                  }}
                                />
                              </ListItemButton>
                            </Tooltip>
                          )
                        })}
                    </List>
                  </Collapse>
                )}
              </Box>
            )
          }

          // ── flat item ───────────────────────────────────────────────
          const selected = location.pathname === item.path
          return (
            <Tooltip
              key={item.path}
              title={collapsed ? t(item.labelKey || item.label) : ''}
              placement="right"
              disableHoverListener={!collapsed}
            >
              <ListItemButton
                selected={selected}
                onClick={() => navigate(item.path)}
                sx={navItemSx}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={t(item.labelKey || item.label)}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: selected ? 700 : 500,
                      textTransform: 'capitalize'
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          )
        })}
      </List>

      <Divider sx={{ mt: 1, mb: 2, width: '85%', borderColor: 'divider' }} />

      <List sx={{ width: '100%', px: 0 }}>
        <Tooltip
          title={collapsed ? t(settingsMenu.labelKey) : ''}
          placement="right"
          disableHoverListener={!collapsed}
        >
          <ListItemButton
            selected={isSettingsRoute}
            onClick={() => {
              if (collapsed) return
              toggleGroup('settings')
            }}
            onMouseEnter={(e) => collapsed && openGroup('settings', e.currentTarget)}
            onMouseLeave={() => collapsed && closeGroup()}
            sx={{ ...navItemSx, justifyContent: collapsed ? 'center' : 'space-between', mb: 0 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 1.5,
                flex: 1,
                minWidth: 0
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 0 }}>
                <SettingsRounded fontSize="medium" />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={t(settingsMenu.labelKey)}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: isSettingsRoute ? 700 : 500 }}
                />
              )}
            </Box>
            {!collapsed && (
              <ExpandMoreRounded
                sx={{
                  fontSize: 18,
                  color: 'text.disabled',
                  flexShrink: 0,
                  transform: settingsGroupOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms ease'
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>

        {collapsed && (
          <CollapsedSubMenu
            anchorEl={hoveredGroupEl}
            open={hoveredGroup === 'settings'}
            item={settingsMenu}
            onClose={closeGroup}
            onOpen={() => clearTimeout(closeTimer.current)}
            navItemSx={navItemSx}
            theme={theme}
          />
        )}

        {!collapsed && (
          <Collapse in={settingsGroupOpen} timeout={160}>
            <List disablePadding sx={{ pl: 1, mb: 0.5 }}>
              {settingsMenu.children.map((child) => {
                const selected = location.pathname === child.path
                const ChildIcon = child.icon ?? HomeRounded
                return (
                  <ListItemButton
                    key={child.path}
                    selected={selected}
                    onClick={() => navigate(child.path)}
                    sx={childItemSx}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                      <ChildIcon sx={{ fontSize: 11 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={t(child.labelKey || child.label)}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: selected ? 700 : 500 }}
                    />
                  </ListItemButton>
                )
              })}
            </List>
          </Collapse>
        )}

        <Tooltip
          title={collapsed ? t('sidebar.cashier_session') : ''}
          placement="right"
          disableHoverListener={!collapsed}
        >
          <ListItemButton onClick={handleOpenCashierDialog} sx={{ ...navItemSx, mb: 0.75 }}>
            <ListItemIcon sx={{ color: isCashierOpen ? 'success.main' : 'inherit' }}>
              <PointOfSaleRounded fontSize="medium" />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary={t('sidebar.cashier_session')}
                secondary={isCashierOpen ? t('sidebar.cashier_open') : t('sidebar.cashier_closed')}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                secondaryTypographyProps={{ fontSize: 11 }}
              />
            )}
          </ListItemButton>
        </Tooltip>

        <Tooltip
          title={collapsed ? t('settings.logout') : ''}
          placement="right"
          disableHoverListener={!collapsed}
        >
          <ListItemButton onClick={logout} sx={{ ...navItemSx, mb: 0 }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogoutRounded fontSize="medium" />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary={t('settings.logout')}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500, color: 'error.main' }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </List>

      <Box sx={{ mt: 'auto', width: '100%', display: 'flex', justifyContent: 'center', pb: 0.5 }}>
        <Tooltip
          title={collapsed ? 'Profile' : ''}
          placement="right"
          disableHoverListener={!collapsed}
        >
          <Box
            sx={{
              width: '100%',
              px: collapsed ? 0 : 1,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 1
            }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: theme.palette.mode === 'dark' ? '#1f2630' : '#dde5f0',
                color: 'text.secondary',
                fontSize: 14,
                fontWeight: 700
              }}
            >
              {initials}
            </Avatar>
            {!collapsed && (
              <Box>
                <Typography sx={{ color: 'text.primary', fontSize: 13, fontWeight: 600 }}>
                  {user?.username || '-'}
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                  {roleLabel}
                  {' • '}
                  {isCashierOpen ? t('sidebar.cashier_open') : t('sidebar.cashier_closed')}
                </Typography>
              </Box>
            )}
          </Box>
        </Tooltip>
      </Box>

      <Dialog
        open={openCashierDialog}
        onClose={() => !cashierLoading && setOpenCashierDialog(false)}
      >
        <DialogTitle>
          {isCashierOpen ? t('sidebar.close_cashier_title') : t('sidebar.open_cashier_title')}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 360, pt: '8px !important' }}>
          <Box sx={{ display: 'grid', gap: 1.2 }}>
            {isCashierOpen && activeSession && (
              <Alert severity="info">
                {t('sidebar.cashier_opened_at')}: {activeSession.opened_at}
                <br />
                {t('sidebar.opening_cash')}: {fmtRp(activeSession.opening_cash)}
              </Alert>
            )}

            <TextField
              label={isCashierOpen ? t('sidebar.closing_cash') : t('sidebar.opening_cash')}
              value={cashierAmount}
              onChange={(e) => setCashierAmount(e.target.value.replace(/\D/g, ''))}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              size="small"
            />
            <TextField
              label={t('sidebar.cashier_note')}
              value={cashierNote}
              onChange={(e) => setCashierNote(e.target.value)}
              size="small"
              multiline
              minRows={2}
            />

            {cashierError && <Alert severity="error">{cashierError}</Alert>}

            {closeSummary && (
              <Alert severity="success">
                {t('sidebar.cashier_revenue')}: {fmtRp(closeSummary.total_sales)}
                <br />
                {t('sidebar.cashier_tx_count')}: {closeSummary.total_transactions}
                <br />
                {t('sidebar.cashier_expected_cash')}: {fmtRp(closeSummary.expected_cash)}
                <br />
                {t('sidebar.cashier_cash_diff')}: {fmtRp(closeSummary.cash_difference)}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCashierDialog(false)} disabled={cashierLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmitCashierSession}
            variant="contained"
            disabled={cashierLoading}
          >
            {isCashierOpen ? t('sidebar.close_cashier_button') : t('sidebar.open_cashier_button')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
