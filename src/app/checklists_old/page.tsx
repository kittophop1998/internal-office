"use client";

import { MainLayout } from "@/components/layouts";
import { Stack, Typography } from "@mui/material";
import ChecklistsCardPage from "./_components/ChecklistCard";
import { useTranslation } from "react-i18next";

export default function ChecklistsPage() {
    const { t } = useTranslation();
    
    return (
        <MainLayout title={t('checklists.title')} backUrl="/dashboard" showBackButton>
            <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>
                    {t('checklists.pageTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('checklists.pageSubtitle')}
                </Typography>
            </Stack>

            <ChecklistsCardPage />
        </MainLayout>
    );
}