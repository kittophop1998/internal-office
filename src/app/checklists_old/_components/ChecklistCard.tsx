"use client";

import { Box, Typography, Paper, Button, CircularProgress, Chip, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AddTaskIcon from "@mui/icons-material/AddTask";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import { useCheckTaskSessionExists, useCreateTaskSession } from "@/hooks/api/useTaskSession";
import { useState } from "react";

type ChecklistType = "DAILY" | "WEEKLY" | "MONTHLY";

function ChecklistCard({
    id,
    type,
    description,
    icon: IconComponent,
    gradient,
    color,
    branchId,
}: {
    id: ChecklistType;
    type: string;
    description: string;
    icon: React.ElementType;
    gradient: string;
    color: string;
    branchId: number;
}) {
    const router = useRouter();
    const { t } = useTranslation();
    const [isNavigating, setIsNavigating] = useState(false);

    const { data: sessionData, isFetching: isChecking } = useCheckTaskSessionExists(
        { branchId, type: id },
        { refetchOnMount: true }
    );

    const createMutation = useCreateTaskSession({
        onSuccess: () => {
            setIsNavigating(true);
            router.push(`/checklists/${id.toLowerCase()}`);
        },
    });

    const sessionExists = sessionData?.exists ?? false;
    const isLoading = isChecking || createMutation.isPending || isNavigating;

    const handleCreate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (sessionExists || isLoading) return;
        createMutation.mutate({ branchId, type: id });
    };

    const handleViewSession = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsNavigating(true);
        router.push(`/checklists/${id.toLowerCase()}`);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 3,
                border: "1px solid",
                borderColor: sessionExists ? `${color}60` : "divider",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                height: "100%",
                minHeight: 280,
                background: (theme) =>
                    theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "#fff",
                "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                    borderColor: color,
                    "& .icon-box": {
                        transform: "scale(1.1) rotate(5deg)",
                    },
                },
            }}
        >
            {/* Gradient Background Decoration */}
            <Box
                sx={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: gradient,
                    borderRadius: "50%",
                    opacity: 0.1,
                    transition: "all 0.3s ease",
                }}
            />

            {/* Session Exists Badge */}
            {sessionExists && (
                <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
                    <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
                        label={t("checklists.sessionCreated")}
                        size="small"
                        color="success"
                        variant="filled"
                        sx={{ fontSize: "0.7rem", fontWeight: 600 }}
                    />
                </Box>
            )}

            {/* Content */}
            <Box
                sx={{
                    position: "relative",
                    zIndex: 1,
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Icon */}
                <Box
                    className="icon-box"
                    sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 3,
                        background: gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                        transition: "all 0.3s ease",
                        boxShadow: `0 8px 24px ${color}40`,
                    }}
                >
                    <IconComponent sx={{ fontSize: 36, color: "#fff" }} />
                </Box>

                {/* Title */}
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 1.5, fontSize: "1.25rem" }}
                >
                    {type}
                </Typography>

                {/* Description */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.6, flex: 1 }}
                >
                    {description}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {/* Create Task Button */}
                    <Tooltip
                        title={sessionExists ? t("checklists.sessionAlreadyExists") : ""}
                        placement="top"
                        disableHoverListener={!sessionExists}
                    >
                        <span style={{ width: "100%" }}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="medium"
                                startIcon={
                                    isLoading && !sessionExists ? (
                                        <CircularProgress size={16} color="inherit" />
                                    ) : (
                                        <AddTaskIcon />
                                    )
                                }
                                onClick={handleCreate}
                                disabled={isLoading || sessionExists}
                                sx={{
                                    borderRadius: 2,
                                    background: sessionExists ? undefined : gradient,
                                    fontWeight: 600,
                                    textTransform: "none",
                                    boxShadow: sessionExists ? undefined : `0 4px 16px ${color}50`,
                                    "&:not(:disabled):hover": {
                                        background: gradient,
                                        opacity: 0.9,
                                        boxShadow: `0 6px 20px ${color}60`,
                                    },
                                }}
                            >
                                {isLoading && !sessionExists
                                    ? t("checklists.creating")
                                    : t("checklists.createTask")}
                            </Button>
                        </span>
                    </Tooltip>

                    {/* View Session Button (visible only when session exists) */}
                    {sessionExists && (
                        <Button
                            fullWidth
                            variant="outlined"
                            size="medium"
                            onClick={handleViewSession}
                            disabled={isNavigating}
                            sx={{
                                borderRadius: 2,
                                borderColor: color,
                                color: color,
                                fontWeight: 600,
                                textTransform: "none",
                                "&:hover": {
                                    borderColor: color,
                                    backgroundColor: `${color}10`,
                                },
                            }}
                        >
                            {isNavigating ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : (
                                t("checklists.viewSession")
                            )}
                        </Button>
                    )}
                </Box>
            </Box>
        </Paper>
    );
}

export default function ChecklistsCardPage() {
    const { t } = useTranslation();

    const [branchId] = useState<number>(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("currentBranchId");
            return stored ? parseInt(stored, 10) : 1;
        }
        return 1;
    });

    const checklistCards = [
        {
            type: t("checklists.daily"),
            description: t("checklists.dailyDesc"),
            icon: CalendarTodayIcon,
            id: "DAILY" as ChecklistType,
            gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#667eea",
        },
        {
            type: t("checklists.weekly"),
            description: t("checklists.weeklyDesc"),
            icon: DateRangeIcon,
            id: "WEEKLY" as ChecklistType,
            gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "#f093fb",
        },
        {
            type: t("checklists.monthly"),
            description: t("checklists.monthlyDesc"),
            icon: EventNoteIcon,
            id: "MONTHLY" as ChecklistType,
            gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "#4facfe",
        },
    ];

    return (
        <Box sx={{ width: "100%", py: 2 }}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                    gap: 3,
                }}
            >
                {checklistCards.map((card) => (
                    <ChecklistCard key={card.id} {...card} branchId={branchId} />
                ))}
            </Box>
        </Box>
    );
}