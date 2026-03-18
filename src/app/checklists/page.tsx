"use client";

import { MainLayout } from "@/components/layouts";
import { useCreateTaskSession, useTaskSession } from "@/hooks/api/useTaskSession";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import SaveIcon from "@mui/icons-material/Save";
import StoreIcon from "@mui/icons-material/Store";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Skeleton,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { TaskSession, TaskSessionAttachment, TaskSessionItem } from "@/services/api/tasksession.service";

interface ImagePreview {
    file: File;
    url: string;
}

const MAX_IMAGES = 3;

const formatSessionDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("th-TH");

const TYPE_LABEL: Record<string, string> = {
    DAILY: "รายวัน",
    WEEKLY: "รายสัปดาห์",
    MONTHLY: "รายเดือน",
};

const TYPE_COLOR: Record<string, string> = {
    DAILY: "#667eea",
    WEEKLY: "#f5576c",
    MONTHLY: "#4facfe",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    PENDING:   { bg: "#fff8e1", color: "#e65100", label: "รอดำเนินการ" },
    COMPLETED: { bg: "#e8f5e9", color: "#2e7d32", label: "เสร็จสิ้น" },
    APPROVED:  { bg: "#e3f2fd", color: "#1565c0", label: "อนุมัติแล้ว" },
};

const SESSION_TYPES = ["DAILY", "WEEKLY", "MONTHLY"] as const;

// ── Skeleton loader ──────────────────────────────────────────────────────────
function SessionSkeletonGroup() {
    return (
        <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", backgroundColor: "background.paper", overflow: "hidden" }}>
            {[0, 1, 2].map((i) => (
                <Box key={i}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2, py: 1.5 }}>
                        <Skeleton variant="circular" width={28} height={28} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="55%" height={22} />
                            <Skeleton variant="text" width="35%" height={16} />
                        </Box>
                        <Skeleton variant="rounded" width={80} height={30} sx={{ borderRadius: 2 }} />
                    </Box>
                    {i < 2 && <Divider />}
                </Box>
            ))}
        </Box>
    );
}

function ChecklistsSkeletons() {
    return (
        <Stack spacing={3}>
            {SESSION_TYPES.map((type) => (
                <Box key={type}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <Skeleton variant="circular" width={10} height={10} />
                        <Skeleton variant="text" width={80} height={22} />
                        <Skeleton variant="rounded" width={24} height={20} sx={{ borderRadius: 1 }} />
                    </Stack>
                    <SessionSkeletonGroup />
                </Box>
            ))}
        </Stack>
    );
}

export default function ChecklistsPage() {
    const { t } = useTranslation();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("currentBranchId");
        setBranchId(stored ? parseInt(stored, 10) : null);
        const storedUserRole = localStorage.getItem("userRole");
        setUserRole(storedUserRole);
        setHasMounted(true);

        const onStorage = (e: StorageEvent) => {
            if (e.key === "currentBranchId") {
                setBranchId(e.newValue ? parseInt(e.newValue, 10) : null);
                createdRef.current = false;
            }
            if (e.key === "userRole") {
                setUserRole(e.newValue);
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const createdRef = useRef(false);
    const [sessionsReady, setSessionsReady] = useState(false);
    const createMutation = useCreateTaskSession();

    useEffect(() => {
        if (createdRef.current || !branchId) return;
        createdRef.current = true;

        const createAll = async () => {
            await Promise.allSettled(
                SESSION_TYPES.map((type) =>
                    createMutation.mutateAsync({ branchId, type })
                )
            );
            setSessionsReady(true);
        };
        createAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [branchId]);

    const { data: sessions = [], isFetching, refetch } = useTaskSession(
        branchId ? { branchId } : undefined,
        { refetchOnMount: true, enabled: !!branchId && sessionsReady }
    );

    // ── Filter tab state ─────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "DONE">("ALL");

    // Session detail dialog state
    const [isPending, startTransition] = useTransition();
    const [selectedSession, setSelectedSession] = useState<TaskSessionItem | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [images, setImages] = useState<ImagePreview[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<TaskSessionAttachment[]>([]);
    const [completedSessions, setCompletedSessions] = useState<number[]>([]);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });

    // ── Micro-interaction: bounce on check ──────────────────────────────────
    const [bouncingId, setBouncingId] = useState<number | null>(null);

    const handleToggleComplete = useCallback((sessionId: number) => {
        setCompletedSessions((prev) => {
            const next = prev.includes(sessionId)
                ? prev.filter((id) => id !== sessionId)
                : [...prev, sessionId];
            if (!prev.includes(sessionId)) {
                setBouncingId(sessionId);
                setTimeout(() => setBouncingId(null), 400);
            }
            return next;
        });
    }, []);

    const handleOpenDetail = useCallback((session: TaskSessionItem) => {
        setSelectedSession(session);
        setExistingAttachments(session.attachments || []);
        setDetailOpen(true);
    }, []);

    const handleCloseDetail = useCallback(() => {
        images.forEach((img) => URL.revokeObjectURL(img.url));
        setImages([]);
        setExistingAttachments([]);
        setDetailOpen(false);
        setSelectedSession(null);
    }, [images]);

    const handleImageUpload = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (!files) return;

            const totalExisting = existingAttachments.length + images.length;
            const remaining = MAX_IMAGES - totalExisting;
            const fileArray = Array.from(files).slice(0, remaining);

            if (fileArray.length < files.length) {
                setSnackbar({ open: true, message: `อัปโหลดได้สูงสุด ${MAX_IMAGES} รูป`, severity: "error" });
            }

            const newImages = fileArray.map((file) => ({ file, url: URL.createObjectURL(file) }));
            setImages((prev) => [...prev, ...newImages]);
        },
        [existingAttachments.length, images.length]
    );

    const handleRemoveImage = useCallback(
        (index: number) => {
            const image = images[index];
            if (image) URL.revokeObjectURL(image.url);
            setImages((prev) => prev.filter((_, idx) => idx !== index));
        },
        [images]
    );

    const handleSaveDetail = useCallback(async () => {
        if (!selectedSession) {
            handleCloseDetail();
            return;
        }

        if (images.length > 0) {
            try {
                const files = images.map((img) => img.file);
                await TaskSession.uploadImage(selectedSession.id, files);
                setSnackbar({ open: true, message: "อัปโหลดรูปภาพเรียบร้อย", severity: "success" });
            } catch (error) {
                console.error("Upload failed:", error);
                setSnackbar({ open: true, message: "ไม่สามารถอัปโหลดรูปภาพได้", severity: "error" });
                return;
            }
        } else {
            setSnackbar({ open: true, message: "บันทึกรายละเอียดเรียบร้อย", severity: "success" });
        }

        handleCloseDetail();
        refetch();
    }, [handleCloseDetail, images, selectedSession, refetch]);

    const handleSaveAllSessions = () => {
        if (completedSessions.length === 0) {
            setSnackbar({ open: true, message: "กรุณาเลือกงานที่ต้องการบันทึก", severity: "error" });
            return;
        }

        startTransition(async () => {
            try {
                const payload = completedSessions.map((id) => ({ sessionId: id, status: "COMPLETED" }));
                await TaskSession.updateSessions(payload);
                setSnackbar({ open: true, message: "บันทึกสถานะงานเรียบร้อยแล้ว", severity: "success" });
                setCompletedSessions([]);
                refetch();
            } catch (error) {
                console.error("Update failed:", error);
                setSnackbar({ open: true, message: "ไม่สามารถบันทึกสถานะงานได้", severity: "error" });
            }
        });
    };

    const handleCloseSnackbar = useCallback(
        () => setSnackbar((prev) => ({ ...prev, open: false })),
        []
    );

    // ── Derived counts for progress bar & tabs ───────────────────────────────
    const totalSessions = sessions.length;
    const doneSessions = sessions.filter(
        (s) => s.status === "COMPLETED" || s.status === "APPROVED" || completedSessions.includes(s.id)
    ).length;
    const progressPct = totalSessions > 0 ? Math.round((doneSessions / totalSessions) * 100) : 0;

    const pendingCount = sessions.filter(
        (s) => s.status !== "COMPLETED" && s.status !== "APPROVED" && !completedSessions.includes(s.id)
    ).length;
    const doneCount = doneSessions;

    // ── Filtered & grouped sessions ──────────────────────────────────────────
    const filteredSessions = sessions.filter((s) => {
        const isDone = s.status === "COMPLETED" || s.status === "APPROVED" || completedSessions.includes(s.id);
        if (activeTab === "PENDING") return !isDone;
        if (activeTab === "DONE") return isDone;
        return true;
    });

    const grouped = SESSION_TYPES.reduce<Record<string, TaskSessionItem[]>>(
        (acc, type) => {
            acc[type] = filteredSessions.filter((s) => s.type === type);
            return acc;
        },
        { DAILY: [], WEEKLY: [], MONTHLY: [] }
    );

    const isLoading = !hasMounted || createMutation.isPending || !sessionsReady || isFetching;

    // ── Image slot helpers ───────────────────────────────────────────────────
    const totalImageSlots = MAX_IMAGES;
    const usedSlots = existingAttachments.length + images.length;
    const canUploadMore = usedSlots < totalImageSlots;

    return (
        <MainLayout title={t("checklists.title")} backUrl="/dashboard" showBackButton={['ADMIN', 'MANAGER'].includes(userRole || '')}>
            {/* ── Page Header ── */}
            <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                <Typography variant="h5" fontWeight={700}>
                    {t("checklists.pageTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    เลือกงานที่ทำเสร็จแล้ว และกดดูรายละเอียดเพื่อแนบรูปภาพเพิ่มเติม
                </Typography>
            </Stack>

            {/* ── No branch selected ── */}
            {!isLoading && !branchId && (
                <Box
                    sx={{
                        py: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        textAlign: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            bgcolor: "action.hover",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <StoreIcon sx={{ fontSize: 40, color: "text.disabled" }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                        กรุณาเลือกสาขาก่อน
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        กดที่ไอคอนสาขาในแถบด้านบนเพื่อเลือกสาขาที่ต้องการ
                    </Typography>
                </Box>
            )}

            {/* ── Loading Skeletons ── */}
            {isLoading && branchId && (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Skeleton variant="rounded" width="100%" height={10} sx={{ borderRadius: 5 }} />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Skeleton variant="rounded" width={280} height={42} sx={{ borderRadius: 2 }} />
                    </Box>
                    <ChecklistsSkeletons />
                </>
            )}

            {/* ── Main Content (data ready) ── */}
            {!isLoading && branchId && (
                <>
                    {/* Progress Bar */}
                    {totalSessions > 0 && (
                        <Box
                            sx={{
                                mb: 3,
                                p: 2,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.paper",
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "success.main" }} />
                                    <Typography variant="body2" fontWeight={600}>
                                        ความคืบหน้าวันนี้
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" fontWeight={700} color={progressPct === 100 ? "success.main" : "text.primary"}>
                                    {doneSessions}/{totalSessions} งาน ({progressPct}%)
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={progressPct}
                                sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: "action.hover",
                                    "& .MuiLinearProgress-bar": {
                                        borderRadius: 5,
                                        background: progressPct === 100
                                            ? "linear-gradient(90deg,#27ae60,#2ecc71)"
                                            : "linear-gradient(90deg,#667eea,#764ba2)",
                                    },
                                }}
                            />
                            {progressPct === 100 && (
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                                    <EmojiEventsOutlinedIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
                                    <Typography variant="caption" fontWeight={600} color="#f59e0b">
                                        ยอดเยี่ยม! คุณทำงานครบทุกรายการแล้ว
                                    </Typography>
                                </Stack>
                            )}
                        </Box>
                    )}

                    {/* Empty state – no sessions at all */}
                    {totalSessions === 0 && (
                        <Box
                            sx={{
                                py: 10,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                                textAlign: "center",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 88,
                                    height: 88,
                                    borderRadius: "50%",
                                    bgcolor: "#e8f5e9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <EmojiEventsOutlinedIcon sx={{ fontSize: 48, color: "#27ae60" }} />
                            </Box>
                            <Typography variant="h6" fontWeight={700}>
                                ยอดเยี่ยม! วันนี้คุณไม่มีงานค้าง 🎉
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                เมื่อมีงานใหม่เข้ามา ระบบจะแสดงที่หน้านี้
                            </Typography>
                        </Box>
                    )}

                    {totalSessions > 0 && (
                        <>
                            {/* Filter Tabs + Save Button */}
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={(_, v) => setActiveTab(v)}
                                    sx={{
                                        minHeight: 40,
                                        bgcolor: "action.hover",
                                        borderRadius: 2,
                                        p: 0.5,
                                        "& .MuiTabs-indicator": { display: "none" },
                                        "& .MuiTab-root": {
                                            minHeight: 34,
                                            minWidth: "auto",
                                            px: 1.5,
                                            py: 0,
                                            borderRadius: 1.5,
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            color: "text.secondary",
                                            transition: "all 0.2s",
                                        },
                                        "& .Mui-selected": {
                                            bgcolor: "background.paper",
                                            color: "primary.main",
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                                        },
                                    }}
                                >
                                    <Tab label={`ทั้งหมด (${totalSessions})`} value="ALL" />
                                    <Tab label={`รอดำเนินการ (${pendingCount})`} value="PENDING" />
                                    <Tab label={`เสร็จสิ้น (${doneCount})`} value="DONE" />
                                </Tabs>

                                <Button
                                    variant="contained"
                                    startIcon={isPending ? undefined : <SaveIcon />}
                                    onClick={handleSaveAllSessions}
                                    disabled={isPending || completedSessions.length === 0}
                                    sx={{ borderRadius: 2, height: 40, minWidth: 130 }}
                                >
                                    {isPending
                                        ? <><Box component="span" sx={{ mr: 1, display: "inline-flex", alignItems: "center" }}><svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="10" style={{ animation: "spin 0.8s linear infinite", transformOrigin: "center" }} /></svg></Box>กำลังบันทึก...</>
                                        : `บันทึก (${completedSessions.length})`
                                    }
                                </Button>
                            </Stack>

                            {/* Empty state for current tab filter */}
                            {filteredSessions.length === 0 && (
                                <Box
                                    sx={{
                                        py: 8,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 1.5,
                                        textAlign: "center",
                                    }}
                                >
                                    <CheckCircleOutlineIcon sx={{ fontSize: 52, color: "success.light" }} />
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {activeTab === "PENDING" ? "ไม่มีงานที่รอดำเนินการ 🎉" : "ยังไม่มีงานที่เสร็จสิ้น"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {activeTab === "PENDING" ? "คุณทำงานครบทุกรายการแล้ว" : "เริ่มทำงานและกด Checkbox เพื่อบันทึกความคืบหน้า"}
                                    </Typography>
                                </Box>
                            )}

                            {/* Session list grouped by type */}
                            <Stack spacing={3}>
                                {SESSION_TYPES.map((type) => {
                                    const typeSessions = grouped[type];
                                    if (typeSessions.length === 0) return null;
                                    const color = TYPE_COLOR[type];
                                    return (
                                        <Box key={type}>
                                            {/* Type Header */}
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                                                <Box
                                                    sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: "50%",
                                                        bgcolor: color,
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <Typography variant="subtitle1" fontWeight={700} color={color}>
                                                    {TYPE_LABEL[type]}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={typeSessions.length}
                                                    sx={{ height: 20, fontSize: "0.7rem", bgcolor: `${color}22`, color }}
                                                />
                                            </Stack>

                                            <Box
                                                sx={{
                                                    borderRadius: 3,
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    backgroundColor: "background.paper",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <List disablePadding>
                                                    {typeSessions.map((session, index) => {
                                                        const isAlreadyCompleted = session.status === "COMPLETED";
                                                        const isApproved = session.status === "APPROVED";
                                                        const isPendingCheck = completedSessions.includes(session.id);
                                                        const isChecked = isAlreadyCompleted || isApproved || isPendingCheck;
                                                        const statusKey = isAlreadyCompleted ? "COMPLETED" : isApproved ? "APPROVED" : "PENDING";
                                                        const badge = STATUS_STYLE[statusKey] ?? STATUS_STYLE["PENDING"];
                                                        const isBouncing = bouncingId === session.id;

                                                        return (
                                                            <Box key={session.id}>
                                                                <ListItem
                                                                    alignItems="flex-start"
                                                                    onClick={() => handleOpenDetail(session)}
                                                                    sx={{
                                                                        cursor: "pointer",
                                                                        transition: "background-color 0.15s",
                                                                        "&:hover": { bgcolor: "action.hover" },
                                                                        "&:active": { bgcolor: "action.selected" },
                                                                        py: 1.5,
                                                                        pr: "120px",
                                                                    }}
                                                                    secondaryAction={
                                                                        <Button
                                                                            size="small"
                                                                            variant="outlined"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleOpenDetail(session);
                                                                            }}
                                                                            sx={{ borderRadius: 2 }}
                                                                        >
                                                                            รายละเอียด
                                                                        </Button>
                                                                    }
                                                                >
                                                                    <ListItemIcon sx={{ minWidth: 44, mt: 0.5 }}>
                                                                        <Checkbox
                                                                            edge="start"
                                                                            checked={isChecked}
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                handleToggleComplete(session.id);
                                                                            }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            disabled={isAlreadyCompleted || isApproved}
                                                                            sx={{
                                                                                p: 0.5,
                                                                                color: color,
                                                                                "&.Mui-checked": { color },
                                                                                "& .MuiSvgIcon-root": {
                                                                                    fontSize: 28,
                                                                                    transform: isBouncing ? "scale(1.35)" : "scale(1)",
                                                                                    transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                                                                                },
                                                                            }}
                                                                        />
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={
                                                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5}>
                                                                                <Typography
                                                                                    component="span"
                                                                                    fontWeight={700}
                                                                                    fontSize="0.95rem"
                                                                                    sx={{
                                                                                        textDecoration: isChecked ? "line-through" : "none",
                                                                                        color: isChecked ? "text.secondary" : "text.primary",
                                                                                        transition: "all 0.2s",
                                                                                    }}
                                                                                >
                                                                                    {session.taskTitle}
                                                                                </Typography>
                                                                                <Box
                                                                                    component="span"
                                                                                    sx={{
                                                                                        display: "inline-block",
                                                                                        px: 1,
                                                                                        py: 0.2,
                                                                                        borderRadius: 1,
                                                                                        fontSize: "0.7rem",
                                                                                        fontWeight: 700,
                                                                                        bgcolor: badge.bg,
                                                                                        color: badge.color,
                                                                                        lineHeight: 1.6,
                                                                                    }}
                                                                                >
                                                                                    {badge.label}
                                                                                </Box>
                                                                            </Stack>
                                                                        }
                                                                        primaryTypographyProps={{ component: "div" }}
                                                                        secondary={
                                                                            <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                                                                                {session.taskDescription && (
                                                                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                                                                                        {session.taskDescription}
                                                                                    </Typography>
                                                                                )}
                                                                                <Typography variant="caption" color="text.disabled">
                                                                                    วันที่: {formatSessionDate(session.date)}
                                                                                </Typography>
                                                                            </Stack>
                                                                        }
                                                                        secondaryTypographyProps={{ component: "div" }}
                                                                    />
                                                                </ListItem>
                                                                {index < typeSessions.length - 1 && <Divider component="li" />}
                                                            </Box>
                                                        );
                                                    })}
                                                </List>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </>
                    )}
                </>
            )}

            {/* ── Detail Dialog ── */}
            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        pb: 1,
                    }}
                >
                    <Stack>
                        <Typography variant="subtitle1" fontWeight={700}>
                            รายละเอียดงาน
                        </Typography>
                        {selectedSession && (
                            <Typography variant="caption" color="text.secondary">
                                {selectedSession.taskTitle}
                            </Typography>
                        )}
                    </Stack>
                    <IconButton onClick={handleCloseDetail} size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 1 }}>
                    <Stack spacing={2.5}>
                        {/* Manager Comment */}
                        {selectedSession?.managerComment && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                                    ความคิดเห็นจากผู้จัดการ
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={selectedSession.managerComment}
                                    disabled
                                    variant="outlined"
                                    sx={{
                                        "& .MuiInputBase-input.Mui-disabled": {
                                            WebkitTextFillColor: "rgba(0, 0, 0, 0.87)",
                                        },
                                    }}
                                />
                            </Box>
                        )}

                        {/* Existing Attachments */}
                        {existingAttachments.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                                    รูปภาพที่อัปโหลดแล้ว
                                </Typography>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3,1fr)",
                                        gap: 1.5,
                                    }}
                                >
                                    {existingAttachments.map((attachment, index) => (
                                        <Box
                                            key={attachment.attachmentId}
                                            sx={{
                                                position: "relative",
                                                aspectRatio: "1/1",
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                border: "1px solid",
                                                borderColor: "divider",
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={attachment.attachmentUrl || ""}
                                                alt={`attachment-${index}`}
                                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Upload New Images */}
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                    แนบรูปภาพ
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {usedSlots}/{MAX_IMAGES} รูป
                                </Typography>
                            </Stack>

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3,1fr)",
                                    gap: 1.5,
                                }}
                            >
                                {/* New preview images */}
                                {images.map((image, index) => (
                                    <Box
                                        key={image.url}
                                        sx={{
                                            position: "relative",
                                            aspectRatio: "1/1",
                                            borderRadius: 2,
                                            overflow: "hidden",
                                            border: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={image.url}
                                            alt={`preview-${index}`}
                                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveImage(index)}
                                            sx={{
                                                position: "absolute",
                                                top: 4,
                                                right: 4,
                                                backgroundColor: "rgba(0,0,0,0.55)",
                                                color: "white",
                                                p: 0.4,
                                                "&:hover": { backgroundColor: "rgba(0,0,0,0.75)" },
                                            }}
                                        >
                                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Box>
                                ))}

                                {/* Dashed upload slot */}
                                {canUploadMore && (
                                    <Box
                                        component="label"
                                        sx={{
                                            aspectRatio: "1/1",
                                            borderRadius: 2,
                                            border: "2px dashed",
                                            borderColor: "primary.light",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 0.5,
                                            cursor: "pointer",
                                            bgcolor: "action.hover",
                                            transition: "background-color 0.15s",
                                            "&:hover": { bgcolor: "primary.50", borderColor: "primary.main" },
                                        }}
                                    >
                                        <CameraAltOutlinedIcon sx={{ fontSize: 28, color: "primary.main", opacity: 0.75 }} />
                                        <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ fontSize: "0.68rem" }}>
                                            เพิ่มรูป
                                        </Typography>
                                        <input type="file" hidden accept="image/*" multiple onChange={handleImageUpload} />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={handleCloseDetail}
                        variant="text"
                        color="inherit"
                        sx={{ color: "text.secondary" }}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveDetail}
                        startIcon={<SaveIcon />}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            color: "white",
                            "&.Mui-disabled": {
                                bgcolor: "action.disabledBackground",
                                color: "action.disabled",
                            },
                        }}
                    >
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Spin keyframe for save button loader */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </MainLayout>
    );
}
