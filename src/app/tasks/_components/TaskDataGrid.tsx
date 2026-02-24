"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Stack,
    Card,
    CardContent,
    CardActions,
    Typography,
    Chip,
    Divider,
    useMediaQuery,
    useTheme,
    List,
    ListItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TaskItem } from "@/services/api/task.service";
import DeleteTaskDialog from "./DeleteDialog";
import { useDeleteTask } from "@/hooks/api/useTask";

interface TaskDataGridProps {
    tasks: TaskItem[];
    onRefresh?: () => void | Promise<void>;
}

// ─── Mobile Card Item ─────────────────────────────────────────────────────────
interface TaskCardItemProps {
    task: TaskItem;
    onEdit: (task: TaskItem) => void;
    onDelete: (task: TaskItem) => void;
}

function TaskCardItem({ task, onEdit, onDelete }: TaskCardItemProps) {
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                overflow: "hidden",
                width: "100%",
            }}
        >
            <CardContent sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
                        {task.title}
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexShrink={0}>
                        <Chip
                            label={task.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                        />
                        {task.subtype && (
                            <Chip
                                label={task.subtype}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem" }}
                            />
                        )}
                    </Stack>
                </Stack>

                {task.description && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, lineHeight: 1.5 }}
                    >
                        {task.description}
                    </Typography>
                )}

                {task.groupName && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, fontStyle: "italic" }}
                    >
                        กลุ่ม: {task.groupName}
                    </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" spacing={2}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="text.disabled">Weight:</Typography>
                        <Typography variant="caption" fontWeight={600}>{task.weight ?? "-"}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="text.disabled">Order:</Typography>
                        <Typography variant="caption" fontWeight={600}>{task.sortOrder}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="text.disabled">ID:</Typography>
                        <Typography variant="caption" fontWeight={600}>#{task.id}</Typography>
                    </Stack>
                </Stack>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2, pt: 0.5, gap: 1 }}>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(task)}
                    sx={{ flex: 1, borderRadius: 2 }}
                >
                    แก้ไข
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDelete(task)}
                    sx={{ flex: 1, borderRadius: 2 }}
                >
                    ลบ
                </Button>
            </CardActions>
        </Card>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function TaskDataGrid({ tasks, onRefresh }: TaskDataGridProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleEdit = useCallback(
        (task: TaskItem) => {
            router.push(`/tasks/${task.id}`);
        },
        [router]
    );

    const handleDeleteClick = (task: TaskItem) => {
        setSelectedTask(task);
        setDeleteDialogOpen(true);
    };

    const deleteTaskMutation = useDeleteTask();
    const handleDeleteConfirm = () => {
        if (!selectedTask) return;

        startTransition(async () => {
            deleteTaskMutation.mutate(selectedTask.id, {
                onSuccess: async () => {
                    setDeleteDialogOpen(false);
                    setSelectedTask(null);
                    
                    if (onRefresh) {
                        await onRefresh();
                    } else {
                        router.refresh();
                    }
                },
                onError: (error) => {
                    console.error("Failed to delete task:", error);
                },
            });
        });
    };

    const handleCloseDialog = () => {
        if (!isPending) {
            setDeleteDialogOpen(false);
            setSelectedTask(null);
        }
    };

    const columns: GridColDef<TaskItem>[] = useMemo(
        () => [
            {
                field: "id",
                headerName: "ID",
                width: 90,
            },
            {
                field: "title",
                headerName: "Title",
                flex: 1,
                minWidth: 200,
            },
            {
                field: "description",
                headerName: "Description",
                flex: 1.5,
                minWidth: 240,
            },
            {
                field: "type",
                headerName: "Type",
                width: 120,
            },
            {
                field: "subtype",
                headerName: "Subtype",
                width: 140,
                valueGetter: (value) => value || "-",
            },
            {
                field: "weight",
                headerName: "Weight",
                width: 110,
            },
            {
                field: "sort_order",
                headerName: "Sort Order",
                width: 120,
            },
            {
                field: "created_at",
                headerName: "Created At",
                width: 180,
            },
            {
                field: "actions",
                headerName: "จัดการ",
                width: 180,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEdit(params.row)}
                        >
                            แก้ไข
                        </Button>
                        <Button
                            size="small"
                            color="error"
                            variant="contained"
                            onClick={() => handleDeleteClick(params.row)}
                        >
                            ลบ
                        </Button>
                    </Stack>
                ),
            },
        ],
        [handleEdit]
    );

    return (
        <>
            {isMobile ? (
                <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {tasks.length === 0 ? (
                        <ListItem sx={{ justifyContent: "center", py: 6 }}>
                            <Typography color="text.secondary">ไม่มีรายการ</Typography>
                        </ListItem>
                    ) : (
                        tasks.map((task) => (
                            <ListItem key={task.id} disablePadding sx={{ width: "100%" }}>
                                <TaskCardItem
                                    task={task}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteClick}
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            ) : (
                <Box sx={{ height: 600, width: "100%" }}>
                    <DataGrid
                        rows={tasks}
                        columns={columns}
                        disableRowSelectionOnClick
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10, page: 0 } },
                        }}
                        sx={{
                            borderRadius: 2,
                            backgroundColor: "background.paper",
                        }}
                    />
                </Box>
            )}

            <DeleteTaskDialog
                open={deleteDialogOpen}
                taskTitle={selectedTask?.title ?? ""}
                loading={isPending}
                onClose={handleCloseDialog}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}
