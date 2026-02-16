"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Stack } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TaskItem } from "@/services/api/task.service";
import DeleteTaskDialog from "./DeleteDialog";
import { useDeleteTask } from "@/hooks/api/useTask";

interface TaskDataGridProps {
    tasks: TaskItem[];
    onRefresh?: () => void | Promise<void>;
}

export default function TaskDataGrid({ tasks, onRefresh }: TaskDataGridProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

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
