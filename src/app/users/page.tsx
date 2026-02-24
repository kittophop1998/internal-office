"use client";

import { MainLayout } from "@/components/layouts";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { useUsers } from "@/hooks/api/useUser";
import UserDataGrid from "./_components/UserDataGrid";
import AddUserDialog from "./_components/AddUserDialog";
import { Loading } from "@/components/common";
import { useState } from "react";

export default function UsersPage() {
    const { t } = useTranslation();
    const { data: users, isLoading } = useUsers();
    const [addDialogOpen, setAddDialogOpen] = useState(false);

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
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddDialogOpen(true)}
                >
                    {t('common.addNew')}
                </Button>
            </Stack>

            {isLoading ? (
                <Loading />
            ) : (
                <UserDataGrid users={users || []} />
            )}

            <AddUserDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
            />
        </MainLayout>
    );
}
