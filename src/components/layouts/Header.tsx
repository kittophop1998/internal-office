'use client';

import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Avatar, Divider, List, ListItem, ListItemIcon, ListItemText, Drawer, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import LanguageIcon from '@mui/icons-material/Language';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import StoreIcon from '@mui/icons-material/Store';
import { useState, useEffect, useMemo } from 'react';
import { useLogout } from '../../hooks/api/useAuth';
import { useBranches } from '../../hooks/api/useMaster';
import { UserInfo } from '@/services/api/auth.service';
import SelectBranchDialog from '@/components/layouts/SelectBranchDialog';

interface HeaderProps {
    userName?: string;
    showBackButton?: boolean;
    backUrl?: string;
    onBack?: () => void;
    title?: string;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('');
}

export default function Header({
    showBackButton = false,
    backUrl,
    onBack,
    title
}: HeaderProps) {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [openBranchDialog, setOpenBranchDialog] = useState(false);
    const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);

    const { logout } = useLogout();
    const { data: branches = [], isLoading: branchesLoading } = useBranches();

    useEffect(() => {
        /* eslint-disable-next-line */
        setIsMounted(true);
        const storedBranchId = localStorage.getItem('currentBranchId');
        if (storedBranchId) {
            setCurrentBranchId(storedBranchId);
        }
    }, []);

    const currentUser = useMemo<UserInfo | null>(() => {
        if (!isMounted) return null;
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    return JSON.parse(userStr) as UserInfo;
                } catch (e) {
                    console.error('Parse error:', e);
                }
            }
        }
        return null;
    }, [isMounted]);

    const currentUserName = currentUser?.fullName || t('header.undefinedUser');
    const currentUserRole = currentUser?.roleName || currentUser?.roleCode || '';
    const initials = getInitials(currentUserName);

    const branchName = useMemo(() => {
        if (currentBranchId && branches.length > 0) {
            const found = branches.find(b => String(b.id) === currentBranchId);
            return found?.name || '';
        }
        return '';
    }, [currentBranchId, branches]);

    const handleBranchChange = (branchId: string | null) => {
        setCurrentBranchId(branchId);
    };

    const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLanguageMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        handleLanguageMenuClose();
    };

    const handleBackClick = () => {
        if (onBack) {
            onBack();
        } else if (backUrl) {
            router.push(backUrl);
        } else {
            router.back();
        }
    };

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: 'transparent',
                mb: 3,
                boxShadow: 'none',
                borderRadius: 0,
                color: 'text.primary'
            }}
        >
            <Toolbar sx={{
                minHeight: { xs: '56px', sm: '64px' },
                justifyContent: 'space-between',
                px: { xs: 1, sm: 2 }
            }}>
                {/* Left Section - Back Button + Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    {showBackButton && (
                        <IconButton
                            onClick={handleBackClick}
                            aria-label="back"
                            size="small"
                            sx={{ mr: { xs: 1, sm: 2 }, color: 'text.primary' }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                    {title && (
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 'bold',
                                color: 'text.primary',
                                fontSize: { xs: '1rem', sm: '1.25rem' },
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                maxWidth: { xs: '150px', sm: 'none' }
                            }}
                        >
                            {title}
                        </Typography>
                    )}
                </Box>

                {/* Right Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>

                    {/* Notification Bell */}
                    {/* <Badge
                        color="error"
                        variant="dot"
                        overlap="circular"
                        sx={{ '& .MuiBadge-dot': { width: 8, height: 8 } }}
                    >
                        <IconButton
                            size="small"
                            aria-label="notifications"
                            sx={{ color: 'text.secondary' }}
                        >
                            <NotificationsIcon />
                        </IconButton>
                    </Badge> */}

                    {/* Vertical Divider */}
                    <Box
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            width: '1px',
                            height: 36,
                            backgroundColor: 'divider'
                        }}
                    />

                    {/* Branch Selector - Desktop */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
                        {branchName ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: 'divider',
                                    '&:hover': { backgroundColor: 'action.hover' }
                                }}
                                onClick={() => setOpenBranchDialog(true)}
                            >
                                <StoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                    {branchName}
                                </Typography>
                            </Box>
                        ) : (
                            <Button
                                size="small"
                                startIcon={<StoreIcon />}
                                onClick={() => setOpenBranchDialog(true)}
                                variant="outlined"
                                sx={{ textTransform: 'none', fontSize: '0.875rem' }}
                            >
                                {t('header.selectBranch')}
                            </Button>
                        )}
                    </Box>

                    {/* Branch Icon - Mobile */}
                    <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
                        <IconButton
                            onClick={() => setOpenBranchDialog(true)}
                            size="small"
                            sx={{ color: 'text.primary' }}
                        >
                            <StoreIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* User Info + Avatar - Desktop */}
                    <Box
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                        }}
                        onClick={handleLanguageMenuOpen}
                    >
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    lineHeight: 1.3,
                                    fontSize: '0.875rem'
                                }}
                            >
                                {currentUserName}
                            </Typography>
                            {currentUserRole && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        fontSize: '0.65rem',
                                        lineHeight: 1.2
                                    }}
                                >
                                    {currentUserRole}
                                </Typography>
                            )}
                        </Box>

                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'grey.200',
                                color: 'text.primary',
                                fontWeight: 700,
                                fontSize: '0.875rem'
                            }}
                        >
                            {initials}
                        </Avatar>
                    </Box>

                    {/* Mobile Menu Button */}
                    <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
                        <IconButton
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="open menu"
                            size="small"
                            sx={{ color: 'text.primary' }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Toolbar>

            {/* Dropdown Menu on avatar click (desktop) */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleLanguageMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { minWidth: 180, mt: 1 } } }}
            >
                <MenuItem
                    onClick={() => handleLanguageChange('th')}
                    selected={i18n.language === 'th'}
                >
                    <LanguageIcon sx={{ mr: 1, fontSize: 18 }} />
                    ไทย (TH)
                </MenuItem>
                <MenuItem
                    onClick={() => handleLanguageChange('en')}
                    selected={i18n.language === 'en'}
                >
                    <LanguageIcon sx={{ mr: 1, fontSize: 18 }} />
                    English (EN)
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={logout}
                    sx={{
                        color: 'error.main',
                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' }
                    }}
                >
                    <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
                    {t('header.logout')}
                </MenuItem>
            </Menu>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { width: 260, pt: 2 }
                }}
            >
                <Box sx={{ px: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 44,
                                height: 44,
                                bgcolor: 'grey.200',
                                color: 'text.primary',
                                fontWeight: 700
                            }}
                        >
                            {initials}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {currentUserName}
                            </Typography>
                            {currentUserRole && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {currentUserRole}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <Divider />
                </Box>
                <List>
                    <ListItem>
                        <ListItemIcon><StoreIcon /></ListItemIcon>
                        <ListItemText
                            primary={branchName || t('header.selectBranch')}
                            secondary={t('header.branch')}
                            onClick={() => { setOpenBranchDialog(true); setMobileMenuOpen(false); }}
                            sx={{ cursor: 'pointer' }}
                        />
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                    <ListItem>
                        <ListItemIcon><LanguageIcon /></ListItemIcon>
                        <ListItemText
                            primary={t('header.language')}
                            secondary={i18n.language === 'th' ? 'ไทย' : 'English'}
                        />
                    </ListItem>
                    <Box sx={{ px: 2, py: 0.5 }}>
                        <MenuItem
                            onClick={() => { handleLanguageChange(i18n.language === 'th' ? 'en' : 'th'); setMobileMenuOpen(false); }}
                            sx={{ borderRadius: 1, border: 1, borderColor: 'divider' }}
                        >
                            <LanguageIcon sx={{ mr: 1, fontSize: 18 }} />
                            {i18n.language === 'th' ? t('header.switchToEnglish') : t('header.switchToThai')}
                        </MenuItem>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <ListItem
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' } }}
                    >
                        <ListItemIcon><LogoutIcon sx={{ color: 'error.main' }} /></ListItemIcon>
                        <ListItemText primary={t('header.logout')} primaryTypographyProps={{ color: 'error.main' }} />
                    </ListItem>
                </List>
            </Drawer>

            {/* Branch Selection Dialog */}
            <SelectBranchDialog
                open={openBranchDialog}
                onClose={() => setOpenBranchDialog(false)}
                branches={branches}
                isLoading={branchesLoading}
                currentBranchId={currentBranchId}
                onBranchChange={handleBranchChange}
            />
        </AppBar>
    );
}
