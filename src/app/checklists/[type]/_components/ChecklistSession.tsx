"use client";

import { useState, useCallback, useTransition } from "react";
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
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Select,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import { TaskSession, TaskSessionItem, TaskSessionAttachment } from "@/services/api/tasksession.service";

type ChecklistType = "DAILY" | "WEEKLY" | "MONTHLY" | string;
type DailySubType = "pre-opening" | "post-closing";

interface ImagePreview {
    file: File;
    url: string;
}

interface Props {
    initialSessions: TaskSessionItem[];
    type: ChecklistType;
    onSubTypeChange?: (subtype: DailySubType | "") => void;
    onSaveSuccess?: () => void;
}

const MAX_IMAGES = 3;

const formatSessionDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("th-TH");

export default function ChecklistSessionList({ initialSessions, type, onSubTypeChange, onSaveSuccess }: Props) {
    const [isPending, startTransition] = useTransition();
    const [dailySubType, setDailySubType] = useState<DailySubType | "">("");
    const [selectedSession, setSelectedSession] = useState<TaskSessionItem | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [images, setImages] = useState<ImagePreview[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<TaskSessionAttachment[]>([]);
    const [completedSessions, setCompletedSessions] = useState<number[]>([]);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

    const handleSubTypeChange = (value: DailySubType | "") => {
        setDailySubType(value);
        onSubTypeChange?.(value);
    };

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

    const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
    }, [existingAttachments.length, images.length]);

    const handleRemoveImage = useCallback((index: number) => {
        const image = images[index];
        if (image) URL.revokeObjectURL(image.url);
        setImages((prev) => prev.filter((_, idx) => idx !== index));
    }, [images]);

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
                console.error('Upload failed:', error);
                setSnackbar({ open: true, message: "ไม่สามารถอัปโหลดรูปภาพได้", severity: "error" });
                return;
            }
        } else {
            setSnackbar({ open: true, message: "บันทึกรายละเอียดเรียบร้อย", severity: "success" });
        }

        handleCloseDetail();
    }, [handleCloseDetail, images, selectedSession]);

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
                // Refresh data after successful save
                onSaveSuccess?.();
            } catch (error) {
                console.error('Update failed:', error);
                setSnackbar({ open: true, message: "ไม่สามารถบันทึกสถานะงานได้", severity: "error" });
            }
        });
    };

    const handleCloseSnackbar = useCallback(() => setSnackbar((prev) => ({ ...prev, open: false })), []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _selectedSession = selectedSession;

    if (initialSessions.length === 0) {
        return (
            <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="h6" fontWeight={600}>ไม่มีรายการในขณะนี้</Typography>
                <Typography variant="body2" color="text.secondary">เมื่อมีงานใหม่ ระบบจะแสดงที่หน้านี้</Typography>
            </Box>
        );
    }

    return (
        <>
            <Stack spacing={2} sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    เลือกงานที่ทำเสร็จแล้ว และกดดูรายละเอียดเพื่อแนบรูปภาพเพิ่มเติม
                </Typography>
                {type === "DAILY" && (
                    <Box sx={{ maxWidth: 280 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="daily-subtype-select">ช่วงเวลา</InputLabel>
                            <Select
                                labelId="daily-subtype-select"
                                value={dailySubType}
                                label="ช่วงเวลา"
                                onChange={(e) => handleSubTypeChange(e.target.value as DailySubType)}
                            >
                                <MenuItem value="">ทั้งหมด</MenuItem>
                                <MenuItem value="pre-opening">ก่อนเปิดร้าน</MenuItem>
                                <MenuItem value="post-closing">ก่อนปิดร้าน</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                )}
            </Stack>

            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveAllSessions}
                    disabled={isPending || completedSessions.length === 0}
                    sx={{ borderRadius: 2 }}
                >
                    {isPending ? "กำลังบันทึก..." : `บันทึก (${completedSessions.length})`}
                </Button>
            </Box>

            <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", backgroundColor: "background.paper" }}>
                <List disablePadding>
                    {initialSessions.map((session, index) => {
                        const isAlreadyCompleted = session.status === "COMPLETED";
                        const isCompleted = isAlreadyCompleted || completedSessions.includes(session.id);
                        return (
                            <Box key={session.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <Button size="small" variant="outlined" onClick={() => handleOpenDetail(session)} sx={{ borderRadius: 2 }}>
                                            รายละเอียด
                                        </Button>
                                    }
                                >
                                    <ListItemIcon>
                                        <Checkbox edge="start" checked={isCompleted} onChange={() => handleToggleComplete(session.id)} disabled={isAlreadyCompleted} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography component="span" fontWeight={600}>{session.taskTitle}</Typography>
                                                <Chip size="small" label={session.status} color={isCompleted ? "success" : "default"} />
                                            </Stack>
                                        }
                                        primaryTypographyProps={{ component: "div" }}
                                        secondary={
                                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                                <Typography variant="body2" color="text.secondary">{session.taskDescription || "ไม่มีคำอธิบาย"}</Typography>
                                                <Typography variant="caption" color="text.secondary">วันที่: {formatSessionDate(session.date)}</Typography>
                                            </Stack>
                                        }
                                        secondaryTypographyProps={{ component: "div" }}
                                    />
                                </ListItem>
                                {index < initialSessions.length - 1 && <Divider component="li" />}
                            </Box>
                        );
                    })}
                </List>
            </Box>

            {/* Detail Dialog */}
            <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    รายละเอียดงาน
                    <IconButton onClick={handleCloseDetail} size="small"><CloseIcon fontSize="small" /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {/* Existing Attachments */}
                        {existingAttachments.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>รูปภาพที่อัปโหลดแล้ว</Typography>
                                <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 2 }}>
                                    {existingAttachments.map((attachment, index) => (
                                        <Box key={attachment.attachment_id} sx={{ position: "relative", width: 110, height: 110, borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                                            <Box component="img" src={attachment.attachment_url || ""} alt={`attachment-${index}`} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* Upload New Images */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>แนบรูปภาพ (สูงสุด {MAX_IMAGES} รูป)</Typography>
                            <Button variant="outlined" component="label" startIcon={<AddPhotoAlternateIcon />} disabled={(existingAttachments.length + images.length) >= MAX_IMAGES} sx={{ borderRadius: 2 }}>
                                เพิ่มรูปภาพ
                                <input type="file" hidden accept="image/*" multiple onChange={handleImageUpload} />
                            </Button>
                            <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: "wrap" }}>
                                {images.map((image, index) => (
                                    <Box key={image.url} sx={{ position: "relative", width: 110, height: 110, borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                                        <Box component="img" src={image.url} alt={`preview-${index}`} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        <IconButton size="small" onClick={() => handleRemoveImage(index)} sx={{ position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.4)", color: "white", "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" } }}>
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
                    <Button variant="contained" onClick={handleSaveDetail} sx={{ borderRadius: 2 }}>บันทึก</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </>
    );
}
