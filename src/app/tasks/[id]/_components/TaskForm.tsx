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
    useMediaQuery,
    useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category";
import WorkIcon from "@mui/icons-material/Work";
import FolderIcon from "@mui/icons-material/Folder";
import { useTask, useCreateTask, useUpdateTask } from "@/hooks/api/useTask";
import { useUsers } from "@/hooks/api/useUser";
import { useTaskGroups } from "@/hooks/api/useMaster";
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const { data: taskData, isLoading: isLoadingTask, isError } = useTask(taskId ?? 0, {
        enabled: mode === "edit" && !!taskId,
    });
    const { data: users = [] } = useUsers();
    const { data: taskGroups = [] } = useTaskGroups();
    
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();

    useEffect(() => {
        if (mode === "edit" && taskId) {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        }
    }, [mode, taskId, queryClient]);

    const computeInitialValues = () => {
        if (mode === "edit" && taskData) {
            const userIds: string[] = [];
            if (taskData.assignments && Array.isArray(taskData.assignments)) {
                userIds.push(...taskData.assignments.map((u) => String(u.userId)));
            }

            return {
                taskName: taskData.title,
                taskDescription: taskData.description ?? "",
                taskType: normalizeTaskType(taskData.type),
                taskSubType: normalizeSubType(taskData.subtype),
                sortOrder: taskData.sortOrder ?? 1,
                weight: (taskData.weight ?? "") as number | "",
                selectedPosition: "all" as Positions,
                selectedUserIds: userIds,
                groupId: taskData.groupId ?? null,
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
    const [groupId, setGroupId] = useState<number | null>(() => computeInitialValues()?.groupId ?? null);

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

    useEffect(() => {
        if (mode === "edit" && taskData) {
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
                    setGroupId(initial.groupId);
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
            description: taskDescription?.trim() || '',
            type: taskType,
            subtype: taskType === "DAILY" ? taskSubType || null : null,
            sortOrder,
            weight: weight === "" ? null : weight,
            users: selectedUserIds.map((id) => toUserIdValue(id)),
            position: selectedPosition,
            groupId: groupId ?? null,
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
                return `${user.fullName ?? ""}`.trim();
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
            <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2 } }}>
                <Stack spacing={2}>
                    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
                    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
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
        <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1, sm: 3 } }}>
            {/* Save Button */}
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: { xs: 2, sm: 3 } }}>
                <Button
                    fullWidth={isMobile}
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
                    borderRadius: { xs: 3, sm: 4 },
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <CardContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: { xs: 3, sm: 4 },
                        p: { xs: 2, sm: 3 },
                        "&:last-child": { pb: { xs: 2, sm: 3 } },
                    }}
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

                    {/* Task Type Section */}
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

                    {/* Task Group */}
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
                            <FolderIcon fontSize="small" /> กลุ่มงาน
                        </Typography>
                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel>เลือกกลุ่มงาน</InputLabel>
                            <Select
                                value={groupId !== null ? String(groupId) : ""}
                                onChange={(e) => {
                                    const val = e.target.value as string;
                                    setGroupId(val === "" ? null : Number(val));
                                }}
                                label="เลือกกลุ่มงาน"
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="">
                                    <em>ไม่ระบุกลุ่มงาน</em>
                                </MenuItem>
                                {taskGroups.map((group) => (
                                    <MenuItem key={group.id} value={String(group.id)}>
                                        {group.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Position Selector */}
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

                    {/* User Assignment */}
                    <Box>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent={{ xs: "flex-start", sm: "space-between" }}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            gap={1}
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
                                                {user.fullName?.[0] ?? "?"}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.fullName ?? "ไม่ระบุชื่อ"}
                                            secondary={user.roleName ?? "ไม่ระบุบทบาท"}
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
