'use client';

import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import LanguageIcon from '@mui/icons-material/Language';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import StoreIcon from '@mui/icons-material/Store';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, useContext, useEffect, useMemo } from 'react';
// import { ThemeModeContext } from '../../app/providers/ThemeProvider';
import { useLogout } from '../../hooks/api/useAuth';
import { useBranches } from '../../hooks/api/useMaster';
import SelectBranchDialog from '@/components/layouts/SelectBranchDialog';

interface HeaderProps {
    userName?: string;
    showBackButton?: boolean;
    backUrl?: string;
    onBack?: () => void;
    title?: string;
}

export default function Header({
    showBackButton = false,
    backUrl,
    onBack,
    title
}: HeaderProps) {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    // const { mode, toggleTheme } = useContext(ThemeModeContext);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openBranchDialog, setOpenBranchDialog] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    const { data: branches = [] } = useBranches();
    const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);

    const { logout } = useLogout();

    useEffect(() => {
        setIsMounted(true);
        
        const storedBranchId = localStorage.getItem("currentBranchId");
        if (storedBranchId) {
            setCurrentBranchId(storedBranchId);
        }
    }, []);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const storedBranchId = localStorage.getItem("currentBranchId");
                if (storedBranchId && !currentBranchId) {
                    setCurrentBranchId(storedBranchId);
                }
            } catch (error) {
                console.error("Error loading branch from storage:", error);
            }
        };

        fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentUserName = useMemo(() => {
        if (!isMounted) {
            return t('header.undefinedUser');
        }

        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    return ( user.fullName || t('header.undefinedUser') );
                } catch (e) {
                    console.error("Parse error:", e);
                }
            }
        }

        return t('header.undefinedUser');
    }, [isMounted, t]);

    const branchName = useMemo(() => {
        if (currentBranchId && branches.length > 0) {
            const currentBranch = branches.find(b => String(b.id) === currentBranchId);
            return currentBranch?.name || '';
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
                justifyContent: 'space-between'
            }}>
                {/* Left Section - Back Button + Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    {/* Back Button */}
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

                    {/* System Name or Custom Title */}
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                            fontWeight: 'bold', 
                            color: 'text.primary',
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            // textOverflow: 'ellipsis',
                            maxWidth: { xs: '150px', sm: 'none' }
                        }}
                    >
                        {title || t('header.systemName')}
                    </Typography>
                </Box>

                {/* Right Section - All Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Desktop View - Hidden on mobile */}
                    <Box sx={{ 
                        display: { xs: 'none', md: 'flex' }, 
                        alignItems: 'center', 
                        gap: 1
                    }}>
                        <AccountCircleIcon sx={{ color: 'text.primary' }} />
                        <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                            {t('header.welcome')}, {currentUserName}
                        </Typography>
                        
                        {/* Branch Selector - Desktop */}
                        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
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
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
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
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {t('header.selectBranch')}
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {/* Mobile Branch Selector - Visible only on tablet/mobile */}
                    <Box sx={{ 
                        display: { xs: 'flex', md: 'none' }, 
                        alignItems: 'center'
                    }}>
                        <IconButton
                            onClick={() => setOpenBranchDialog(true)}
                            size="small"
                            sx={{ 
                                color: 'text.primary',
                                padding: '6px'
                            }}
                        >
                            <StoreIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Desktop Controls - Hidden on mobile */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        {/* Theme Toggle */}
                        {/* <IconButton
                            onClick={toggleTheme}
                            aria-label="toggle theme"
                            size="small"
                            sx={{ mr: 1, color: 'text.primary' }}
                        >
                            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton> */}

                        {/* Language Toggle */}
                        <Box>
                            <IconButton
                                color="inherit"
                                onClick={handleLanguageMenuOpen}
                                aria-label="change language"
                                size="small"
                                sx={{ gap: 0.5, color: 'text.primary' }}
                            >
                                <LanguageIcon />
                                <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                                    {i18n.language}
                                </Typography>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleLanguageMenuClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem
                                    onClick={() => handleLanguageChange('th')}
                                    selected={i18n.language === 'th'}
                                >
                                    ไทย (TH)
                                </MenuItem>
                                <MenuItem
                                    onClick={() => handleLanguageChange('en')}
                                    selected={i18n.language === 'en'}
                                >
                                    English (EN)
                                </MenuItem>
                            </Menu>
                        </Box>

                        {/* Logout Button */}
                        <IconButton
                            onClick={logout}
                            aria-label="logout"
                            size="small"
                            sx={{
                                ml: 2,
                                color: 'text.primary',
                                '&:hover': {
                                    color: 'error.main',
                                    backgroundColor: 'rgba(211, 47, 47, 0.04)'
                                }
                            }}
                        >
                            <LogoutIcon />
                        </IconButton>
                    </Box>

                    {/* Mobile Menu Button - Visible only on mobile */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
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

            {/* Mobile Drawer Menu */}
            <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: 280,
                        pt: 2
                    }
                }}
            >
                <Box sx={{ px: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccountCircleIcon sx={{ mr: 1, color: 'text.primary' }} />
                        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                            {currentUserName}
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                </Box>

                <List>
                    {/* Branch Info */}
                    <ListItem>
                        <ListItemIcon>
                            <StoreIcon />
                        </ListItemIcon>
                        <ListItemText 
                            primary={branchName || t('header.selectBranch')} 
                            secondary={t('header.branch')}
                            onClick={() => {
                                setOpenBranchDialog(true);
                                setMobileMenuOpen(false);
                            }}
                            sx={{ cursor: 'pointer' }}
                        />
                    </ListItem>

                    <Divider sx={{ my: 1 }} />

                    {/* Theme Toggle */}
                    {/* <ListItem
                        onClick={toggleTheme}
                        sx={{ cursor: 'pointer' }}
                    >
                        <ListItemIcon>
                            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </ListItemIcon>
                        <ListItemText 
                            primary={mode === 'dark' ? t('header.lightMode') : t('header.darkMode')} 
                        />
                    </ListItem> */}

                    {/* Language */}
                    <ListItem>
                        <ListItemIcon>
                            <LanguageIcon />
                        </ListItemIcon>
                        <ListItemText 
                            primary={t('header.language')} 
                            secondary={i18n.language === 'th' ? 'ไทย' : 'English'}
                        />
                    </ListItem>
                    
                    <Box sx={{ px: 2, py: 1 }}>
                        <Button
                            fullWidth
                            size="small"
                            onClick={() => handleLanguageChange(i18n.language === 'th' ? 'en' : 'th')}
                            variant="outlined"
                            sx={{ textTransform: 'none' }}
                        >
                            {i18n.language === 'th' ? t('header.switchToEnglish') : t('header.switchToThai')}
                        </Button>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Logout */}
                    <ListItem 
                        onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                        }}
                        sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.04)'
                            }
                        }}
                    >
                        <ListItemIcon>
                            <LogoutIcon sx={{ color: 'error.main' }} />
                        </ListItemIcon>
                        <ListItemText 
                            primary={t('header.logout')} 
                            primaryTypographyProps={{ color: 'error.main' }}
                        />
                    </ListItem>
                </List>
            </Drawer>

            {/* Branch Selection Dialog */}
            <SelectBranchDialog
                open={openBranchDialog}
                onClose={() => setOpenBranchDialog(false)}
                branches={branches}
                currentBranchId={currentBranchId}
                onBranchChange={handleBranchChange}
            />
        </AppBar>
    );
}
