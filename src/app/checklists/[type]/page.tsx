"use client";

import { MainLayout } from "@/components/layouts";
import { Stack, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import ChecklistSessionList from "./_components/ChecklistSession";
import { useCheckTaskSessionExists, useCreateTaskSession, useTaskSession } from "@/hooks/api/useTaskSession";
import { useState, useEffect, useMemo } from "react";

export default function ChecklistTypePage() {
    const params = useParams();
    const { type } = params as { type: string };
    const [dailySubType, setDailySubType] = useState<string>("");
    const [currentBranchId] = useState<number | null>(() => {
        if (typeof window !== "undefined") {
            const storedBranchId = localStorage.getItem("currentBranchId");
            return storedBranchId ? parseInt(storedBranchId, 10) : null;
        }
        return null;
    });

    const { data: taskSessionExitsData, isLoading: isCheckingSession } = useCheckTaskSessionExists({
        branchId: currentBranchId ?? 1,
        type: "DAILY",
    });

    const createTaskSessionMutation = useCreateTaskSession();

    const isSessionReady = useMemo(() => {
        if (isCheckingSession) return false;
        if (taskSessionExitsData?.exists) return true;
        if (createTaskSessionMutation.isSuccess) return true;
        
        return false;
    }, [isCheckingSession, taskSessionExitsData, createTaskSessionMutation.isSuccess]);

    useEffect(() => {
        if (!isCheckingSession && 
            taskSessionExitsData !== undefined && 
            !taskSessionExitsData.exists && 
            !createTaskSessionMutation.isPending &&
            !createTaskSessionMutation.isSuccess) {
            createTaskSessionMutation.mutate({
                branchId: currentBranchId ?? 1,
                type: "DAILY",
            });
        }
    }, [isCheckingSession, taskSessionExitsData, currentBranchId, createTaskSessionMutation]);

    const { data: sessions, refetch } = useTaskSession({
        type: type.toUpperCase(),
        subType: dailySubType || undefined,
        branchId: currentBranchId || undefined,
    }, {
        enabled: isSessionReady,
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