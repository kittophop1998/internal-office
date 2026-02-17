"use client";

import { MainLayout } from "@/components/layouts";
import { Stack, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import ChecklistSessionList from "./_components/ChecklistSession";
import { useTaskSession } from "@/hooks/api/useTaskSession";
import { useState } from "react";

export default function ChecklistTypePage() {
    const params = useParams();
    const { type } = params as { type: string };
    const [dailySubType, setDailySubType] = useState<string>("");

    const branchId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('currentBranchId') || '0') : 0;

    const { data: sessions, refetch } = useTaskSession({
        type: type.toUpperCase(),
        subType: dailySubType || undefined,
        branchId: branchId || undefined,
    });

    const handleSubTypeChange = (subtype: string) => {
        setDailySubType(subtype);
    };

    const handleSaveSuccess = () => {
        refetch();
    };

    return (
        <MainLayout title={`${type.charAt(0).toUpperCase() + type.slice(1)} Checklist`} backUrl="/checklists" showBackButton>
            <Stack spacing={2} sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>{type.charAt(0).toUpperCase() + type.slice(1)} Checklist</Typography>
            </Stack>

            <ChecklistSessionList 
                type={type.toUpperCase()} 
                initialSessions={sessions || []} 
                onSubTypeChange={handleSubTypeChange}
                onSaveSuccess={handleSaveSuccess}
            />
        </MainLayout>
    );
}