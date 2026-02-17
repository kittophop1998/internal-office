"use client";

import { MainLayout } from "@/components/layouts";
import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useUsers } from "@/hooks/api/useUser";
import UserDataGrid from "./_components/UserDataGrid";
import { Loading } from "@/components/common";

export default function UsersPage() {
    const { t } = useTranslation();
    const { data: users, isLoading } = useUsers();
    
    return (
        <MainLayout title={t('users.pageTitle')} backUrl="/dashboard" showBackButton>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
                sx={{ mb: 2 }}
            >
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        {t('users.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('users.subtitle')}
                    </Typography>
                </Box>
            </Stack>

            {isLoading ? (
                <Loading />
            ) : (
                <UserDataGrid users={users || []} />
            )}
        </MainLayout>
    );
}