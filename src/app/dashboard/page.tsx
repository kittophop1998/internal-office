"use client";

import { MainLayout } from "@/components/layouts";
import ChecklistIcon from '@mui/icons-material/ChecklistRtl';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditNoteIcon from '@mui/icons-material/EditNote';
import GradingIcon from '@mui/icons-material/Grading';
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
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                    {t('dashboard.title')}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    {t('dashboard.welcome')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('dashboard.selectMenu')}
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
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
                                        transform: 'translateY(-8px)',
                                        boxShadow: 6,
                                    },
                                }}
                            >
                                <CardActionArea
                                    onClick={() => handleMenuClick(item.path, item.isActive)}
                                    sx={{ height: '100%', p: 2 }}
                                >
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, textAlign: 'center' }}>
                                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                            <IconComponent sx={{ fontSize: 40, color: item.color }} />
                                        </Box>
                                        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                                            {t(`dashboard.${item.key}`)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
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