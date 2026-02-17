"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    InputLabel,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Skeleton,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category";
import WorkIcon from "@mui/icons-material/Work";
import { useTask, useCreateTask, useUpdateTask } from "@/hooks/api/useTask";
import { useUsers } from "@/hooks/api/useUser";
import { useTranslation } from "react-i18next";

// ===== Types =====
type TaskTypeApi = "DAILY" | "WEEKLY" | "MONTHLY";
type TaskSubTypeApi = "pre-opening" | "post-closing";
type Positions = "all" | "store_manager" | "cashier" | "stock_keeper" | "sales" | "manager" | "admin" | "staff";

const TASK_TYPE_OPTIONS: Array<{ id: TaskTypeApi; label: string }> = [
    { id: "DAILY", label: "รายวัน" },
    { id: "WEEKLY", label: "รายสัปดาห์" },
    { id: "MONTHLY", label: "รายเดือน" },
];

const TASK_SUB_TYPE_OPTIONS: Array<{ id: TaskSubTypeApi; label: string }> = [
    { id: "pre-opening", label: "ก่อนเปิดร้าน" },
    { id: "post-closing", label: "หลังปิดร้าน" },
];

const POSITION_OPTIONS: Array<{ id: Positions; title: string }> = [
    { id: "all", title: "ส่วนรวม" },
    { id: "sales", title: "พนักงานขาย" },
    { id: "cashier", title: "แคชเชียร์" },
    { id: "manager", title: "ผู้จัดการ" },
    { id: "store_manager", title: "ผู้จัดการสาขา" },
    { id: "stock_keeper", title: "พนักงานสต็อก" },
];

// ===== Helper Functions =====
const normalizeTaskType = (value?: string | null): TaskTypeApi => {
    if (!value) return "DAILY";
    const upper = value.toUpperCase();
    if (upper === "DAILY" || upper === "WEEKLY" || upper === "MONTHLY") {
        return upper as TaskTypeApi;
    }
    return "DAILY";
};

const normalizeSubType = (value?: string | null): TaskSubTypeApi | "" => {
    if (!value) return "";
    if (value === "opening") return "pre-opening";
    if (value === "closing") return "post-closing";
    if (value === "pre-opening" || value === "post-closing") return value;
    return "";
};

const toUserIdValue = (value: number | string) => {
    const asNumber = Number(value);
    return Number.isNaN(asNumber) ? String(value) : asNumber;
};

// ===== Props =====
interface TaskFormProps {
    mode: "create" | "edit";
    taskId?: number;
}

export default function TaskForm({ mode, taskId }: TaskFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const { data: taskData, isLoading: isLoadingTask, isError } = useTask(taskId ?? 0, {
        enabled: mode === "edit" && !!taskId,
    });
    const { data: users = [] } = useUsers();
    
    // Mutations
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();

    // 🔥 Clear cache เมื่อ component mount ในโหมด edit
    useEffect(() => {
        if (mode === "edit" && taskId) {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        }
    }, [mode, taskId, queryClient]);

    // Compute initial form values based on mode and taskData
    const computeInitialValues = () => {
        if (mode === "edit" && taskData) {
            const userIds: string[] = [];
            if (taskData.users && Array.isArray(taskData.users)) {
                userIds.push(...taskData.users.map((u) => String(u.id)));
            }

            return {
                taskName: taskData.title,
                taskDescription: taskData.description ?? "",
                taskType: normalizeTaskType(taskData.type),
                taskSubType: normalizeSubType(taskData.subtype),
                sortOrder: taskData.sort_order ?? 1,
                weight: (taskData.weight ?? "") as number | "",
                selectedPosition: "all" as Positions,
                selectedUserIds: userIds,
            };
        }
        
        return null;
    };

    // Form states with lazy initialization
    const [taskName, setTaskName] = useState(() => computeInitialValues()?.taskName ?? "");
    const [taskDescription, setTaskDescription] = useState(() => computeInitialValues()?.taskDescription ?? "");
    const [taskType, setTaskType] = useState<TaskTypeApi>(() => computeInitialValues()?.taskType ?? "DAILY");
    const [taskSubType, setTaskSubType] = useState<TaskSubTypeApi | "">(() => computeInitialValues()?.taskSubType ?? "");
    const [sortOrder, setSortOrder] = useState(() => computeInitialValues()?.sortOrder ?? 1);
    const [weight, setWeight] = useState<number | "">(() => computeInitialValues()?.weight ?? "");
    const [selectedPosition, setSelectedPosition] = useState<Positions>(() => computeInitialValues()?.selectedPosition ?? "all");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(() => computeInitialValues()?.selectedUserIds ?? []);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    // Ref to track current taskId to detect changes
    const prevTaskIdRef = useRef<number | undefined>(undefined);

    // Update form fields when taskData changes (fresh data loaded)
    useEffect(() => {
        if (mode === "edit" && taskData) {
            // Check if this is new data (either first load or taskId changed)
            const isNewData = prevTaskIdRef.current !== taskId;
            
            if (isNewData) {
                prevTaskIdRef.current = taskId;
                
                const initial = computeInitialValues();
                if (initial) {
                    setTaskName(initial.taskName);
                    setTaskDescription(initial.taskDescription);
                    setTaskType(initial.taskType);
                    setTaskSubType(initial.taskSubType);
                    setSortOrder(initial.sortOrder);
                    setWeight(initial.weight);
                    setSelectedUserIds(initial.selectedUserIds);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, taskData, taskId]);

    useEffect(() => {
        if (mode === "edit" && isError && taskId) {
            setSnackbar({
                open: true,
                message: "ไม่พบข้อมูลรายการ",
                severity: "error",
            });
        }
    }, [mode, isError, taskId]);

    const handlePositionChange = (position: Positions) => {
        setSelectedPosition(position);
        setSelectedUserIds([]);
    };

    const handleSave = async () => {
        if (!taskName.trim()) {
            setSnackbar({
                open: true,
                message: t('taskForm.taskNameRequired'),
                severity: "error",
            });
            return;
        }

        if (taskType === "DAILY" && !taskSubType) {
            setSnackbar({
                open: true,
                message: t('taskForm.timeSlotRequired'),
                severity: "error",
            });
            return;
        }

        const payload = {
            title: taskName.trim(),
            description: taskDescription?.trim() || null,
            type: taskType,
            subtype: taskType === "DAILY" ? taskSubType || null : null,
            sortOrder,
            weight: weight === "" ? null : weight,
            users: selectedUserIds.map((id) => toUserIdValue(id)),
            position: selectedPosition,
        };

        try {
            if (mode === "edit" && taskId) {
                await updateTaskMutation.mutate({ id: taskId, data: payload });
            } else {
                await createTaskMutation.mutate(payload);
            }

            setSnackbar({
                open: true,
                message: mode === "edit" ? t('taskForm.updateSuccess') : t('taskForm.createSuccess'),
                severity: "success",
            });
            setTimeout(() => router.push("/tasks"), 900);
        } catch (error) {
            console.error("Failed to save task:", error);
            setSnackbar({
                open: true,
                message: t('example.saveError'),
                severity: "error",
            });
        }
    };
    
    const isSaving = createTaskMutation.isPending || updateTaskMutation.isPending;

    const filteredUsers = useMemo(
        () =>
            users?.filter(
                (user) => selectedPosition === "all" || user.roleName === selectedPosition
            ),
        [selectedPosition, users]
    );

    const handleSelectAllUsers = useCallback(() => {
        setSelectedUserIds(filteredUsers.map((user) => String(user.id)));
    }, [filteredUsers]);

    const handleClearAllUsers = useCallback(() => {
        setSelectedUserIds([]);
    }, []);

    const getDisplayName = useCallback(
        (userId: string) => {
            const user = users.find((item) => Number(item.id) === Number(userId));
            if (user) {
                return `${user.fullname ?? ""}`.trim();
            }
            return "ไม่ระบุชื่อ";
        },
        [users]
    );

    const handleRemoveUser = (userId: string) => {
        setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    };

    // Show loading state
    const isLoading = mode === "edit" ? isLoadingTask : false;
    
    if (isLoading) {
        return (
            <Container maxWidth="xl" sx={{ py: 2 }}>
                <Stack spacing={2}>
                    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Stack spacing={3}>
                            <Skeleton variant="text" height={40} width="40%" />
                            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
                            <Skeleton variant="text" height={40} width="30%" />
                            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                            <Divider />
                            <Box display="flex" gap={2}>
                                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, flex: 1 }} />
                                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, flex: 1 }} />
                            </Box>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 2 }}>
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
                <Button
                    variant="contained"
                    startIcon={
                        isSaving ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            <SaveIcon />
                        )
                    }
                    onClick={handleSave}
                    disabled={isSaving}
                    sx={{ borderRadius: 3, px: 4, fontWeight: "bold" }}
                >
                    {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
            </Stack>

            <Card
                sx={{
                    borderRadius: 4,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <CardContent
                    sx={{ display: "flex", flexDirection: "column", gap: 4, p: 3 }}
                >
                    {/* Task Name */}
                    <Box>
                        <Typography
                            variant="overline"
                            fontWeight="bold"
                            color="text.secondary"
                            gutterBottom
                            display="flex"
                            alignItems="center"
                            gap={1}
                        >
                            <AssignmentIcon fontSize="small" /> ชื่อรายการตรวจสอบ
                        </Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="เช่น เช็คสต็อกสินค้า..."
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            sx={{ mt: 1 }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                    </Box>

                    {/* Description */}
                    <Box>
                        <Typography
                            variant="overline"
                            fontWeight="bold"
                            color="text.secondary"
                            gutterBottom
                        >
                            คำอธิบาย (ไม่บังคับ)
                        </Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="รายละเอียดเพิ่มเติม..."
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            multiline
                            rows={3}
                            sx={{ mt: 1 }}
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                    </Box>

                    {/* Task Type Section - Inline */}
                    <Box>
                        <Typography
                            variant="overline"
                            fontWeight="bold"
                            color="text.secondary"
                            gutterBottom
                            display="flex"
                            alignItems="center"
                            gap={1}
                        >
                            <CategoryIcon fontSize="small" /> ประเภทงาน
                        </Typography>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
                            <FormControl fullWidth>
                                <InputLabel>ความถี่</InputLabel>
                                <Select
                                    value={taskType}
                                    onChange={(e) => {
                                        const value = e.target.value as TaskTypeApi;
                                        setTaskType(value);
                                        if (value !== "DAILY") {
                                            setTaskSubType("");
                                        }
                                    }}
                                    label="ความถี่"
                                    sx={{ borderRadius: 2 }}
                                >
                                    {TASK_TYPE_OPTIONS.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {taskType === "DAILY" && (
                                <FormControl fullWidth>
                                    <InputLabel>ช่วงเวลา</InputLabel>
                                    <Select
                                        value={taskSubType}
                                        onChange={(e) => setTaskSubType(e.target.value as TaskSubTypeApi)}
                                        label="ช่วงเวลา"
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {TASK_SUB_TYPE_OPTIONS.map((option) => (
                                            <MenuItem key={option.id} value={option.id}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                            <FormControl sx={{ width: { xs: "100%", sm: "200px" } }}>
                                <TextField
                                    label="ลำดับที่"
                                    type="number"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(Number(e.target.value))}
                                    inputProps={{ min: 1 }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                />
                            </FormControl>

                            <FormControl sx={{ width: { xs: "100%", sm: "200px" } }}>
                                <TextField
                                    label="น้ำหนักคะแนน"
                                    type="number"
                                    value={weight}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setWeight(val === "" ? "" : Number(val));
                                    }}
                                    inputProps={{ min: 0 }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                />
                            </FormControl>
                        </Stack>
                    </Box>

                    {/* Position Selector - Inline */}
                    <Box>
                        <Typography
                            variant="overline"
                            fontWeight="bold"
                            color="text.secondary"
                            gutterBottom
                            display="flex"
                            alignItems="center"
                            gap={1}
                        >
                            <WorkIcon fontSize="small" /> เลือกตำแหน่งงาน
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                            {POSITION_OPTIONS.map((option) => (
                                <Chip
                                    key={option.id}
                                    label={option.title}
                                    clickable
                                    color={selectedPosition === option.id ? "primary" : "default"}
                                    onClick={() => handlePositionChange(option.id)}
                                    sx={{ fontWeight: "bold", px: 1 }}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {/* User Assignment - Inline */}
                    <Box>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 1 }}
                        >
                            <Typography
                                variant="overline"
                                fontWeight="bold"
                                color="text.secondary"
                                display="flex"
                                alignItems="center"
                                gap={1}
                            >
                                <PersonIcon fontSize="small" /> มอบหมายพนักงาน
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={handleSelectAllUsers}
                                    disabled={filteredUsers?.length === 0}
                                    sx={{ borderRadius: 2, fontSize: "0.75rem" }}
                                >
                                    เลือกทั้งหมด
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={handleClearAllUsers}
                                    disabled={selectedUserIds.length === 0}
                                    sx={{ borderRadius: 2, fontSize: "0.75rem" }}
                                >
                                    ล้างทั้งหมด
                                </Button>
                            </Stack>
                        </Stack>

                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel id="user-select-label">เลือกพนักงาน</InputLabel>
                            <Select
                                labelId="user-select-label"
                                multiple
                                value={selectedUserIds}
                                onChange={(e) => setSelectedUserIds(e.target.value as string[])}
                                input={<OutlinedInput label="เลือกพนักงาน" sx={{ borderRadius: 2 }} />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                        {selected.map((userId) => {
                                            const displayName = getDisplayName(userId);
                                            return (
                                                <Chip
                                                    key={userId}
                                                    label={displayName}
                                                    onDelete={() => handleRemoveUser(userId)}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    size="small"
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {filteredUsers?.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        <Checkbox checked={selectedUserIds.indexOf(String(user.id)) > -1} />
                                        <ListItemAvatar>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                                                {user.fullname}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.fullname ?? "ไม่ระบุชื่อ"}
                                            secondary={user.roleName ?? 'ไม่ระบุบทบาท'}
                                        />
                                    </MenuItem>
                                ))}
                                {filteredUsers?.length === 0 && (
                                    <MenuItem disabled>ไม่พบพนักงานในตำแหน่งที่เลือก</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
