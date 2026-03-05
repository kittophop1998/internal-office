"use client";

import { MainLayout } from "@/components/layouts";
import ChecklistIcon from '@mui/icons-material/ChecklistRtl';
import EditNoteIcon from '@mui/icons-material/EditNote';
import GradingIcon from '@mui/icons-material/Grading';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Box, CardActionArea, CardContent, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/common";
import { useRouter } from "next/navigation";
import { useState } from "react";

const menuItems = [
    {
        key: 'checklistsMenu',
        icon: ChecklistIcon,
        path: '/checklists',
        isActive: true,
        color: '#10b981',
        role: ['ADMIN', 'MANAGER', 'STAFF'],
    },
    {
        key: 'tasksMenu',
        icon: EditNoteIcon,
        path: '/tasks',
        isActive: true,
        color: '#3b82f6',
        role: ['ADMIN', 'MANAGER'],
    },
    {
        key: 'userManagement',
        icon: ManageAccountsIcon,
        path: '/users',
        isActive: true,
        color: '#ec4899',
        role: ['ADMIN'],
    },
    {
        key: 'taskReviewMenu',
        icon: GradingIcon,
        path: '/taskreview',
        isActive: true,
        color: '#8b5cf6',
        role: ['ADMIN', 'MANAGER'],
    },
    {
        key: 'reportsMenu',
        icon: SummarizeIcon,
        path: '/reports',
        isActive: true,
        color: '#8b5cf6',
        role: ['ADMIN'],
    },
];

export default function DashboardPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [userRole] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    return user.roleCode || 'staff';
                } catch (e) {
                    console.error("Parse error:", e);
                }
            }
        }

        return 'staff';
    });

    const handleMenuClick = (path: string, isActive: boolean) => {
        if (!isActive) return
        router.push(path)
    };

    const filteredMenuItems = menuItems.filter((item) => item.role.includes(userRole));

    return (
        <MainLayout title="Dashboard" showBackButton={false}>
            <Box sx={{ mb: { xs: 3, sm: 6 }, textAlign: 'center', px: { xs: 1, sm: 0 } }}>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                    {t('dashboard.welcome')}
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                    {t('dashboard.selectMenu')}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(2, 1fr)',
                    },
                    gap: { xs: 2, sm: 3 },
                    px: { xs: 0, sm: 0 },
                }}
            >
                {filteredMenuItems
                    .filter((item) => item.isActive)
                    .map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <Card
                                key={item.key}
                                elevation={2}
                                sx={{
                                    height: '100%',
                                    transition: 'all 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: { xs: 'none', sm: 'translateY(-8px)' },
                                        boxShadow: { xs: 2, sm: 6 },
                                    },
                                    '&:active': {
                                        transform: 'scale(0.97)',
                                        boxShadow: 1,
                                    },
                                    borderRadius: { xs: 3, sm: 2 },
                                }}
                            >
                                <CardActionArea
                                    onClick={() => handleMenuClick(item.path, item.isActive)}
                                    sx={{ height: '100%', p: { xs: 1, sm: 2 } }}
                                >
                                    <CardContent
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minHeight: { xs: 140, sm: 200 },
                                            textAlign: 'center',
                                            p: { xs: 1, sm: 2 },
                                            '&:last-child': { pb: { xs: 1, sm: 2 } },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: { xs: 56, sm: 80 },
                                                height: { xs: 56, sm: 80 },
                                                borderRadius: '50%',
                                                bgcolor: `${item.color}15`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: { xs: 1.5, sm: 3 },
                                            }}
                                        >
                                            <IconComponent
                                                sx={{
                                                    fontSize: { xs: 28, sm: 40 },
                                                    color: item.color,
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            variant="h5"
                                            component="h2"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 600,
                                                color: 'text.primary',
                                                mb: { xs: 0.5, sm: 1 },
                                                fontSize: { xs: '0.95rem', sm: '1.5rem' },
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {t(`dashboard.${item.key}`)}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                px: { xs: 0, sm: 2 },
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                display: { xs: 'none', sm: 'block' },
                                            }}
                                        >
                                            {t(`dashboard.${item.key}Desc`)}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        );
                    })}
            </Box>
        </MainLayout>
    )
}