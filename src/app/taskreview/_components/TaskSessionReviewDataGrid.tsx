import { TaskSessionItem } from "@/services/api/tasksession.service";
import { Box, Button, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface TaskSessionReviewDataGridProps {
    tasks: TaskSessionItem[];
    onSave?: (reviews: { sessionId: number; status: string; managerComment?: string }[]) => void;
}

type ReviewStatus = 'APPROVED' | 'REJECT' | null;

interface ReviewState {
    [key: number]: ReviewStatus;
}

interface TaskRow {
    id: number;
    date: string;
    status: string;
    taskId: number;
    taskTitle: string;
    taskDescription: string | null;
    sessionScore: number;
    managerComment: string;
    userId: number;
    userName: string;
    attachments: unknown[];
}

export default function TaskSessionReviewDataGrid({ tasks, onSave }: TaskSessionReviewDataGridProps) {
    const [reviewStates, setReviewStates] = useState<ReviewState>({});
    const { t } = useTranslation();

    const handleApprove = (sessionId: number) => {
        setReviewStates(prev => ({
            ...prev,
            [sessionId]: 'APPROVED'
        }));
    };

    const handleReject = (sessionId: number) => {
        setReviewStates(prev => ({
            ...prev,
            [sessionId]: 'REJECT'
        }));
    };

    const column: GridColDef<TaskRow>[] = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'taskTitle', headerName: 'Task Name', width: 200 },
        { field: 'taskDescription', headerName: 'Task Description', width: 250 },
        { field: 'status', headerName: 'Status', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 250,
            sortable: false,
            renderCell: (params) => {
                const currentStatus = reviewStates[params.row.id];
                
                return (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant={currentStatus === 'APPROVED' ? 'contained' : 'outlined'}
                            color="success"
                            size="small"
                            startIcon={<ThumbUpIcon />}
                            onClick={() => handleApprove(params.row.id)}
                        >
                            {t('dialog.approve')}
                        </Button>
                        <Button
                            variant={currentStatus === 'REJECT' ? 'contained' : 'outlined'}
                            color="error"
                            size="small"
                            startIcon={<ThumbDownIcon />}
                            onClick={() => handleReject(params.row.id)}
                        >
                            {t('dialog.reject')}
                        </Button>
                    </Stack>
                );
            }
        }
    ], [reviewStates, t]);

    const summary = useMemo(() => {
        const approved = Object.values(reviewStates).filter(status => status === 'APPROVED').length;
        const rejected = Object.values(reviewStates).filter(status => status === 'REJECT').length;
        const total = tasks.length;
        const pending = total - approved - rejected;

        return { approved, rejected, pending, total };
    }, [reviewStates, tasks.length]);

    const handleSave = () => {
        const reviews = Object.entries(reviewStates)
            .filter(([, status]) => status !== null)
            .map(([sessionId, status]) => ({
                sessionId: Number(sessionId),
                status: status as string,
                managerComment: ''
            }));

        if (reviews.length > 0 && onSave) {
            onSave(reviews);
        }
    };

    return (
        <>
            <Box>
                <DataGrid
                    rows={tasks as unknown as TaskRow[]}
                    columns={column}
                    autoHeight
                    disableRowSelectionOnClick
                />
            </Box>

            {/* Summary Section */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                    {t('taskReview.title')}
                </Typography>
                <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CheckCircleIcon color="success" />
                        <Typography variant="body1">
                            {t('dialog.approved')}: <strong>{summary.approved}</strong>
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CancelIcon color="error" />
                        <Typography variant="body1">
                            {t('dialog.rejected')}: <strong>{summary.rejected}</strong>
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1" color="text.secondary">
                            Pending: <strong>{summary.pending}</strong>
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1">
                            Total: <strong>{summary.total}</strong>
                        </Typography>
                    </Stack>
                </Stack>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={summary.approved === 0 && summary.rejected === 0}
                >
                    {t('dialog.saveReview')}
                </Button>
            </Box>
        </>
    );
}