"use client";

import { MainLayout } from "@/components/layouts";
import { useCreateTaskSession, useTaskSession } from "@/hooks/api/useTaskSession";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
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

const SESSION_TYPES = ["DAILY", "WEEKLY", "MONTHLY"] as const;

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
    const createMutation = useCreateTaskSession();

    // Call createTaskSession for all types when branchId is available (backend handles idempotency)
    useEffect(() => {
        if (createdRef.current || !branchId) return;
        createdRef.current = true;

        SESSION_TYPES.forEach((type) => {
            createMutation.mutate({ branchId, type });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [branchId]);

    const { data: sessions = [], isFetching, refetch } = useTaskSession(
        branchId ? { branchId } : undefined,
        { refetchOnMount: true, enabled: !!branchId }
    );

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

    const handleToggleComplete = useCallback((sessionId: number) => {
        setCompletedSessions((prev) =>
            prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]
        );
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

    // Group sessions by type
    const grouped = SESSION_TYPES.reduce<Record<string, TaskSessionItem[]>>(
        (acc, type) => {
            acc[type] = sessions.filter((s) => s.type === type);
            return acc;
        },
        { DAILY: [], WEEKLY: [], MONTHLY: [] }
    );

    const isLoading = createMutation.isPending || isFetching;
    
    return (
        <MainLayout title={t("checklists.title")} backUrl="/dashboard" showBackButton={['ADMIN', 'MANAGER'].includes(userRole || '')}>
            <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700}>
                    {t("checklists.pageTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    เลือกงานที่ทำเสร็จแล้ว และกดดูรายละเอียดเพื่อแนบรูปภาพเพิ่มเติม
                </Typography>
            </Stack>

            {isLoading && sessions.length === 0 ? (
                <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
                    <CircularProgress />
                </Box>
            ) : !hasMounted ? (
                <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
                    <CircularProgress />
                </Box>
            ) : !branchId ? (
                <Box
                    sx={{
                        py: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        textAlign: "center",
                    }}
                >
                    <StoreIcon sx={{ fontSize: 56, color: "text.disabled" }} />
                    <Typography variant="h6" fontWeight={600}>
                        กรุณาเลือกสาขาก่อน
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        กดที่ไอคอนสาขาในแถบด้านบนเพื่อเลือกสาขาที่ต้องการ
                    </Typography>
                </Box>
            ) : sessions.length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                    <Typography variant="h6" fontWeight={600}>
                        ไม่มีรายการในขณะนี้
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        เมื่อมีงานใหม่ ระบบจะแสดงที่หน้านี้
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Save Button */}
                    <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            variant="contained"
                            startIcon={
                                isPending ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    <SaveIcon />
                                )
                            }
                            onClick={handleSaveAllSessions}
                            disabled={isPending || completedSessions.length === 0}
                            sx={{ borderRadius: 2 }}
                        >
                            {isPending ? "กำลังบันทึก..." : `บันทึก (${completedSessions.length})`}
                        </Button>
                    </Box>

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
                                            sx={{ height: 20, fontSize: "0.7rem", bgcolor: `${color}20`, color }}
                                        />
                                    </Stack>

                                    <Box
                                        sx={{
                                            borderRadius: 3,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            backgroundColor: "background.paper",
                                        }}
                                    >
                                        <List disablePadding>
                                            {typeSessions.map((session, index) => {
                                                const isAlreadyCompleted = session.status === "COMPLETED";
                                                const isApproved = session.status === "APPROVED";
                                                const isChecked =
                                                    isAlreadyCompleted ||
                                                    isApproved ||
                                                    completedSessions.includes(session.id);
                                                return (
                                                    <Box key={session.id}>
                                                        <ListItem
                                                            alignItems="flex-start"
                                                            secondaryAction={
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    onClick={() => handleOpenDetail(session)}
                                                                    sx={{ borderRadius: 2 }}
                                                                >
                                                                    รายละเอียด
                                                                </Button>
                                                            }
                                                        >
                                                            <ListItemIcon>
                                                                <Checkbox
                                                                    edge="start"
                                                                    checked={isChecked}
                                                                    onChange={() => handleToggleComplete(session.id)}
                                                                    disabled={isAlreadyCompleted || isApproved}
                                                                    sx={{
                                                                        color: color,
                                                                        "&.Mui-checked": { color },
                                                                    }}
                                                                />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={
                                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                                        <Typography component="span" fontWeight={600}>
                                                                            {session.taskTitle}
                                                                        </Typography>
                                                                        <Chip
                                                                            size="small"
                                                                            label={session.status}
                                                                            color={isChecked ? "success" : "default"}
                                                                        />
                                                                    </Stack>
                                                                }
                                                                primaryTypographyProps={{ component: "div" }}
                                                                secondary={
                                                                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            {session.taskDescription || "ไม่มีคำอธิบาย"}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            วันที่: {formatSessionDate(session.date)}
                                                                        </Typography>
                                                                    </Stack>
                                                                }
                                                                secondaryTypographyProps={{ component: "div" }}
                                                            />
                                                        </ListItem>
                                                        {index < typeSessions.length - 1 && (
                                                            <Divider component="li" />
                                                        )}
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

            {/* Detail Dialog */}
            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    รายละเอียดงาน
                    <IconButton onClick={handleCloseDetail} size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {/* Manager Comment */}
                        {selectedSession?.managerComment && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
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
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                    รูปภาพที่อัปโหลดแล้ว
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 2 }}>
                                    {existingAttachments.map((attachment, index) => (
                                        <Box
                                            key={attachment.attachmentId}
                                            sx={{
                                                position: "relative",
                                                width: 110,
                                                height: 110,
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
                                </Stack>
                            </Box>
                        )}

                        {/* Upload New Images */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                แนบรูปภาพ (สูงสุด {MAX_IMAGES} รูป)
                            </Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<AddPhotoAlternateIcon />}
                                disabled={(existingAttachments.length + images.length) >= MAX_IMAGES}
                                sx={{ borderRadius: 2 }}
                            >
                                เพิ่มรูปภาพ
                                <input type="file" hidden accept="image/*" multiple onChange={handleImageUpload} />
                            </Button>
                            <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: "wrap" }}>
                                {images.map((image, index) => (
                                    <Box
                                        key={image.url}
                                        sx={{
                                            position: "relative",
                                            width: 110,
                                            height: 110,
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
                                                backgroundColor: "rgba(0,0,0,0.4)",
                                                color: "white",
                                                "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                                            }}
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDetail}>ยกเลิก</Button>
                    <Button variant="contained" onClick={handleSaveDetail} sx={{ borderRadius: 2 }}>
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
        </MainLayout>
    );
}
