"use client";

import { MainLayout } from "@/components/layouts";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { useTasks } from "@/hooks/api/useTask";
import TaskDataGrid from "./_components/TaskDataGrid";
import { useTranslation } from "react-i18next";

export default function TaskPage() {
    const router = useRouter();
    const { data } = useTasks();
    const { t } = useTranslation();

    return (
        <MainLayout title={t('tasks.pageTitle')} showBackButton backUrl="/dashboard">
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
                sx={{ mb: 2 }}
            >
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        {t('tasks.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('tasks.subtitle')}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push("/tasks/new")}
                    sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
                >
                    {t('tasks.addNew')}
                </Button>
            </Stack>

            <TaskDataGrid tasks={data || []} />
        </MainLayout>
    )
}