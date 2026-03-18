'use client';

import React, { useMemo, useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Chip,
  Backdrop,
  Tooltip,
} from '@mui/material';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import ChecklistRtlOutlinedIcon from '@mui/icons-material/ChecklistRtlOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import GradingOutlinedIcon from '@mui/icons-material/GradingOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'next/navigation';
import { useLogout } from '../../hooks/api/useAuth';
import { UserInfo } from '@/services/api/auth.service';

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentBranchName?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

/**
 * Sidebar component สำหรับ navigation menu — redesigned
 */
export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, currentBranchName }) => {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useLogout();

  const [isMounted] = useState(() => typeof window !== 'undefined');

  const currentUser = useMemo<UserInfo | null>(() => {
    if (!isMounted) return null;
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as UserInfo) : null;
    } catch {
      return null;
    }
  }, [isMounted]);

  const fullName = currentUser?.fullName || t('header.undefinedUser');
  const roleName = currentUser?.roleName || currentUser?.roleCode || '';
  const roleCode = (currentUser?.roleCode ?? '').toLowerCase();
  const initials = getInitials(fullName);

  const menuItems = [
    { labelKey: 'navigation.dashboard',   icon: <SpaceDashboardOutlinedIcon />,  href: '/dashboard',   allowedRoles: ['admin', 'manager'] },
    { labelKey: 'navigation.checklists',  icon: <ChecklistRtlOutlinedIcon />,    href: '/checklists',  allowedRoles: ['admin', 'manager', 'staff', 'cashier', 'sales'] },
    { labelKey: 'navigation.tasks',       icon: <AssignmentOutlinedIcon />,      href: '/tasks',       allowedRoles: ['admin', 'manager'] },
    { labelKey: 'navigation.taskReview',  icon: <GradingOutlinedIcon />,         href: '/taskreview',  allowedRoles: ['admin', 'manager'] },
    { labelKey: 'navigation.reports',     icon: <BarChartOutlinedIcon />,        href: '/reports',     allowedRoles: ['admin', 'manager'] },
    { labelKey: 'navigation.users',       icon: <PeopleAltOutlinedIcon />,       href: '/users',       allowedRoles: ['admin', 'manager'] },
  ].filter((item) => item.allowedRoles.includes(roleCode));

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const handleLangSwitch = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <>
      <Backdrop
        open={open}
        onClick={onClose}
        sx={{ zIndex: (theme) => theme.zIndex.drawer - 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
      />

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: 'none',
          },
        }}
      >
        {/* ── Profile Section ──────────────────────────────────── */}
        <Box
          sx={{
            px: 2.5,
            pt: 3,
            pb: 2.5,
            background: 'linear-gradient(135deg, #1a2e5a 0%, #2a4a7f 100%)',
            color: '#fff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'rgba(255,255,255,0.18)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                border: '2px solid rgba(255,255,255,0.35)',
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 170,
                }}
              >
                {fullName}
              </Typography>
              {roleName && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.65)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontSize: '0.65rem',
                  }}
                >
                  {roleName}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Branch Info Card */}
          {currentBranchName && (
            <Box
              sx={{
                mt: 2,
                px: 1.5,
                py: 1,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <StorefrontOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.75)' }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block', lineHeight: 1.1, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t('header.branch')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3 }}>
                  {currentBranchName}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* ── Navigation List ──────────────────────────────────── */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1.5 }}>
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <ListItem key={item.href} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigate(item.href)}
                    sx={{
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: isActive ? 'rgba(26, 46, 90, 0.08)' : 'transparent',
                      '&:hover': { backgroundColor: 'rgba(26, 46, 90, 0.06)' },
                      '&::before': isActive
                        ? {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '20%',
                            height: '60%',
                            width: 3,
                            borderRadius: '0 4px 4px 0',
                            backgroundColor: '#1a2e5a',
                          }
                        : {},
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: isActive ? '#1a2e5a' : 'text.secondary',
                        '& .MuiSvgIcon-root': { fontSize: '1.2rem' },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={t(item.labelKey)}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#1a2e5a' : 'text.primary',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* ── Preferences: Language ────────────────────────────── */}
        <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LanguageOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}>
              {t('header.language')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="ภาษาไทย">
              <Chip
                label="ไทย"
                size="small"
                clickable
                onClick={() => handleLangSwitch('th')}
                sx={{
                  flex: 1,
                  fontWeight: i18n.language === 'th' ? 700 : 400,
                  backgroundColor: i18n.language === 'th' ? '#1a2e5a' : 'transparent',
                  color: i18n.language === 'th' ? '#fff' : 'text.secondary',
                  border: '1px solid',
                  borderColor: i18n.language === 'th' ? '#1a2e5a' : 'divider',
                  '&:hover': { backgroundColor: i18n.language === 'th' ? '#2a4a7f' : 'action.hover' },
                }}
              />
            </Tooltip>
            <Tooltip title="English">
              <Chip
                label="EN"
                size="small"
                clickable
                onClick={() => handleLangSwitch('en')}
                sx={{
                  flex: 1,
                  fontWeight: i18n.language === 'en' ? 700 : 400,
                  backgroundColor: i18n.language === 'en' ? '#1a2e5a' : 'transparent',
                  color: i18n.language === 'en' ? '#fff' : 'text.secondary',
                  border: '1px solid',
                  borderColor: i18n.language === 'en' ? '#1a2e5a' : 'divider',
                  '&:hover': { backgroundColor: i18n.language === 'en' ? '#2a4a7f' : 'action.hover' },
                }}
              />
            </Tooltip>
          </Box>
        </Box>

        {/* ── Sticky Logout ─────────────────────────────────────── */}
        <Box sx={{ px: 1.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              px: 1.5,
              py: 1,
              color: '#b91c1c',
              '&:hover': { backgroundColor: 'rgba(185,28,28,0.06)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit', '& .MuiSvgIcon-root': { fontSize: '1.2rem' } }}>
              <LogoutOutlinedIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('header.logout')}
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#b91c1c' }}
            />
          </ListItemButton>
        </Box>
      </Drawer>
    </>
  );
};
