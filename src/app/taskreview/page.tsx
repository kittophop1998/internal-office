"use client";

import { MainLayout } from "@/components/layouts";
import { useTaskReview, useUpdateTaskReview } from "@/hooks/api/useTaskReview";
import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
import { useState } from "react";
import TaskSessionReviewDataGrid from "./_components/TaskSessionReviewDataGrid";
import { useNotification } from "@/hooks/useNotification";
import { useTranslation } from "react-i18next";

const TAB_OPTIONS = [
    { label: "taskReview.daily", value: "DAILY" },
    { label: "taskReview.weekly", value: "WEEKLY" },
    { label: "taskReview.monthly", value: "MONTHLY" },
];

export default function TaskReviewPage() {
    const [activeTab, setActiveTab] = useState("DAILY");
    const { showSuccess, showError } = useNotification();
    const { t } = useTranslation();
    const theme = useTheme();

    const { data: tasksReview, refetch, isFetching } = useTaskReview({
        type: activeTab,
        branchId: typeof window !== 'undefined' ? parseInt(localStorage.getItem('currentBranchId') || '0') : 0,
    });

    const { mutate: saveReviews } = useUpdateTaskReview({
        onSuccess: () => {
            showSuccess(t('taskReview.saveSuccess'));
            refetch();
        },
        onError: (error) => {
            showError(t('taskReview.saveError', { message: error.message }));
        }
    });

    const handleSaveReviews = (reviews: { sessionId: number; status: string; managerComment?: string }[]) => {
        reviews.forEach(review => {
            saveReviews(review);
        });
    };

    return (
        <MainLayout title={t('taskReview.title')} backUrl="/dashboard" showBackButton>
            {/* ── Page Header ── */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        {t('taskReview.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {t('taskReview.subtitle')}
                    </Typography>
                </Box>
            </Stack>

            {/* ── Pill Tabs ── */}
            <Box
                sx={{
                    display: 'inline-flex',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
                    borderRadius: 99,
                    p: 0.5,
                    mb: 3,
                }}
            >
                {TAB_OPTIONS.map((tab) => {
                    const isActive = activeTab === tab.value;
                    return (
                        <Box
                            key={tab.value}
                            component="button"
                            onClick={() => setActiveTab(tab.value)}
                            sx={{
                                border: 'none',
                                cursor: 'pointer',
                                px: { xs: 2, sm: 3 },
                                py: 1,
                                borderRadius: 99,
                                fontFamily: theme.typography.fontFamily,
                                fontSize: '0.875rem',
                                fontWeight: isActive ? 700 : 500,
                                transition: 'all 0.2s ease',
                                bgcolor: isActive ? 'primary.main' : 'transparent',
                                color: isActive ? 'primary.contrastText' : 'text.secondary',
                                boxShadow: isActive
                                    ? `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`
                                    : 'none',
                                '&:hover': {
                                    bgcolor: isActive
                                        ? 'primary.dark'
                                        : alpha(theme.palette.primary.main, 0.12),
                                    color: isActive ? 'primary.contrastText' : 'primary.main',
                                },
                            }}
                        >
                            {t(tab.label)}
                        </Box>
                    );
                })}
            </Box>

            {/* ── Content ── */}
            <TaskSessionReviewDataGrid
                tasks={tasksReview || []}
                onSave={handleSaveReviews}
                isLoading={isFetching}
            />
        </MainLayout>
    );
}