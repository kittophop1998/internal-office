"use client";

import { Card } from "@/components/common";
import { MainLayout } from "@/components/layouts";
import { useTaskReview, useUpdateTaskReview } from "@/hooks/api/useTaskReview";
import { Box, CardContent, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import TaskSessionReviewDataGrid from "./_components/TaskSessionReviewDataGrid";
import { useNotification } from "@/hooks/useNotification";
import { useTranslation } from "react-i18next";

export default function TaskReviewPage() {
    const [activeTab, setActiveTab] = useState("DAILY");
    const { showSuccess, showError } = useNotification();
    const { t } = useTranslation();

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    const { data: tasksReview, refetch } = useTaskReview({ type: activeTab, branchId: typeof window !== 'undefined' ? parseInt(localStorage.getItem('currentBranchId') || '0') : 0 });
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
            {/* Page Header */}
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
                sx={{ mb: 2 }}
            >
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        {t('taskReview.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('taskReview.subtitle')}
                    </Typography>
                </Box>
            </Stack>

            {/* Content Card */}
            <Card>
                <CardContent>
                    {/* Tabs */}
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
                    >
                        <Tab label={t('taskReview.daily')} value="DAILY" />
                        <Tab label={t('taskReview.weekly')} value="WEEKLY" />
                        <Tab label={t('taskReview.monthly')} value="MONTHLY" />
                    </Tabs>

                    <TaskSessionReviewDataGrid 
                        tasks={tasksReview || []} 
                        onSave={handleSaveReviews}
                    />
                </CardContent>
            </Card>
        </MainLayout>
    );
}