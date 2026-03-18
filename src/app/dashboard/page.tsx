"use client";

import { MainLayout } from "@/components/layouts";
import ChecklistIcon from '@mui/icons-material/ChecklistRtl';
import EditNoteIcon from '@mui/icons-material/EditNote';
import GradingIcon from '@mui/icons-material/Grading';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
    Box,
    CardActionArea,
    CardContent,
    Typography,
    alpha,
    useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/common";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItem {
    key: string;
    icon: React.ElementType;
    path: string;
    isActive: boolean;
    color: string;
    role: string[];
    descKey: string;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItem {
    key: string;
    icon: React.ElementType;
    path: string;
    isActive: boolean;
    color: string;
    role: string[];
    descKey: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const menuItems: MenuItem[] = [
    { key: 'checklistsMenu', icon: ChecklistIcon, path: '/checklists', isActive: true, color: '#10b981', role: ['ADMIN', 'MANAGER', 'STAFF'], descKey: 'checklistsMenuDesc' },
    { key: 'tasksMenu', icon: EditNoteIcon, path: '/tasks', isActive: true, color: '#3b82f6', role: ['ADMIN', 'MANAGER'], descKey: 'tasksMenuDesc' },
    { key: 'userManagement', icon: ManageAccountsIcon, path: '/users', isActive: true, color: '#ec4899', role: ['ADMIN'], descKey: 'userManagementDesc' },
    { key: 'taskReviewMenu', icon: GradingIcon, path: '/taskreview', isActive: true, color: '#8b5cf6', role: ['ADMIN', 'MANAGER'], descKey: 'taskReviewMenuDesc' },
    { key: 'reportsMenu', icon: SummarizeIcon, path: '/reports', isActive: true, color: '#f59e0b', role: ['ADMIN'], descKey: 'reportsMenuDesc' },
];

// ─── Helper Hooks ─────────────────────────────────────────────────────────────

function useUserInfo() {
    const [info] = useState<{ name: string; role: string }>(() => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    return { name: user.fullName || user.username || '', role: user.roleCode || 'STAFF' };
                } catch { /* ignore */ }
            }
        }
        return { name: '', role: 'STAFF' };
    });
    return info;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GreetingSection({ name }: { name: string }) {
    const { t } = useTranslation();
    const theme = useTheme();
    const hour = new Date().getHours();
    const timeKey = hour < 12 ? 'greetingMorning' : hour < 18 ? 'greetingAfternoon' : 'greetingEvening';
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <Box
            sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                borderRadius: 4,
                p: { xs: 2.5, sm: 4 },
                mb: 3,
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative circles */}
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />
            <Box sx={{ position: 'absolute', bottom: -50, right: 60, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.2rem', sm: '1.6rem' }, mb: 0.5 }}>
                    {t('dashboard.greeting', { time: t(`dashboard.${timeKey}`), name: name || '' })}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, opacity: 0.9 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16 }} />
                    <Typography variant="caption" fontWeight={500}>{today}</Typography>
                </Box>
            </Box>
        </Box>
    );
}

function MenuGridSection({ items, onNavigate }: { items: MenuItem[]; onNavigate: (path: string) => void }) {
    const { t } = useTranslation();
    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                {t('dashboard.menuOverview')}
            </Typography>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                    gap: { xs: 1.5, sm: 2 },
                }}
            >
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Card
                            key={item.key}
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.25s ease',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                '&:hover': {
                                    transform: { xs: 'none', sm: 'translateY(-6px)' },
                                    boxShadow: `0 12px 32px ${alpha(item.color, 0.2)}`,
                                    borderColor: alpha(item.color, 0.4),
                                },
                                '&:active': { transform: 'scale(0.97)', boxShadow: 1 },
                            }}
                        >
                            <CardActionArea onClick={() => onNavigate(item.path)} sx={{ height: '100%' }}>
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        py: { xs: 2, sm: 3 },
                                        px: { xs: 1, sm: 2 },
                                        textAlign: 'center',
                                        '&:last-child': { pb: { xs: 2, sm: 3 } },
                                    }}
                                >
                                    {/* Top accent bar */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: 3,
                                            bgcolor: item.color,
                                            borderRadius: '12px 12px 0 0',
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            width: { xs: 50, sm: 64 },
                                            height: { xs: 50, sm: 64 },
                                            borderRadius: '50%',
                                            bgcolor: alpha(item.color, 0.12),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: { xs: 1.25, sm: 2 },
                                        }}
                                    >
                                        <Icon sx={{ fontSize: { xs: 24, sm: 30 }, color: item.color }} />
                                    </Box>
                                    <Typography
                                        variant="body1"
                                        fontWeight={700}
                                        sx={{ color: 'text.primary', mb: 0.5, fontSize: { xs: '0.8rem', sm: '0.95rem' }, lineHeight: 1.3 }}
                                    >
                                        {t(`dashboard.${item.key}`)}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.4, fontSize: '0.72rem' }}
                                    >
                                        {t(`dashboard.${item.descKey}`)}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
}

function DashboardFooter() {
    const { t } = useTranslation();
    const theme = useTheme();
    return (
        <Box
            sx={{
                mt: 2,
                py: 3,
                px: { xs: 2, sm: 4 },
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                borderRadius: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'center' },
                justifyContent: 'space-between',
                gap: 1.5,
                textAlign: { xs: 'center', sm: 'left' },
            }}
        >
            <Box>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                    {t('header.systemName')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {t('dashboard.footerVersion')} 1.0.0 · © 2025 {t('dashboard.footerRights')}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography
                    variant="caption"
                    color="primary.main"
                    sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                >
                    {t('dashboard.footerHelp')}
                </Typography>
                <Typography
                    variant="caption"
                    color="primary.main"
                    sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                >
                    {t('dashboard.footerContact')}
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const router = useRouter();
    const { name, role } = useUserInfo();

    const filteredMenuItems = useMemo(
        () => menuItems.filter((item) => item.role.includes(role)),
        [role]
    );

    const handleNavigate = (path: string) => router.push(path);

    return (
        <MainLayout title="Dashboard" showBackButton={false}>
            <Box sx={{ maxWidth: 900, mx: 'auto', pb: 4 }}>
                <GreetingSection name={name} />
                <MenuGridSection items={filteredMenuItems} onNavigate={handleNavigate} />
                <DashboardFooter />
            </Box>
        </MainLayout>
    );
}