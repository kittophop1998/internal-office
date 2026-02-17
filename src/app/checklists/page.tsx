import { MainLayout } from "@/components/layouts";
import { Stack, Typography } from "@mui/material";
import ChecklistsCardPage from "./_components/ChecklistCard";

export default function ChecklistsPage() {
    return (
        <MainLayout title="Checklists" backUrl="/dashboard" showBackButton>
            <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>
                    เลือกประเภท Checklist
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    เลือกประเภทงานที่ต้องการตรวจสอบเพื่อสร้าง session ใหม่
                </Typography>
            </Stack>

            <ChecklistsCardPage />
        </MainLayout>
    );
}