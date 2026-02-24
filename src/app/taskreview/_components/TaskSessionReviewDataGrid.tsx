import { TaskSessionItem } from "@/services/api/tasksession.service";
import {
    Box, Button, Stack, Typography,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, ImageList, ImageListItem,
    Card, CardContent, CardActions, Chip, Divider,
    List, ListItem, useMediaQuery, useTheme,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

interface TaskSessionReviewDataGridProps {
    tasks: TaskSessionItem[];
    onSave?: (reviews: { sessionId: number; status: string; managerComment?: string }[]) => void;
}

type ReviewStatus = 'APPROVED' | 'REJECT' | null;

interface ReviewState {
    [key: number]: ReviewStatus;
}

interface CommentState {
    [key: number]: string;
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
    attachments: Array<{
        attachmentId: number;
        attachmentUrl: string;
    }>;
}

// ─── Mobile Review Card ───────────────────────────────────────────────────────
interface ReviewCardItemProps {
    task: TaskRow;
    reviewStatus: ReviewStatus;
    comment: string;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onCommentChange: (id: number, value: string) => void;
    onViewDetail: (task: TaskRow) => void;
}

function ReviewCardItem({
    task,
    reviewStatus,
    comment,
    onApprove,
    onReject,
    onCommentChange,
    onViewDetail,
}: ReviewCardItemProps) {
    const { t } = useTranslation();

    const statusColor = reviewStatus === 'APPROVED'
        ? 'success'
        : reviewStatus === 'REJECT'
            ? 'error'
            : 'default';

    const statusLabel = reviewStatus === 'APPROVED'
        ? t('dialog.approved')
        : reviewStatus === 'REJECT'
            ? t('dialog.rejected')
            : 'Pending';

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: reviewStatus === 'APPROVED'
                    ? 'success.light'
                    : reviewStatus === 'REJECT'
                        ? 'error.light'
                        : 'divider',
                backgroundColor: 'background.paper',
                width: '100%',
                overflow: 'hidden',
            }}
        >
            <CardContent sx={{ pb: 1 }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
                        {task.taskTitle}
                    </Typography>
                    <Chip
                        label={statusLabel}
                        size="small"
                        color={statusColor as 'success' | 'error' | 'default'}
                        variant={reviewStatus ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600, fontSize: '0.7rem', flexShrink: 0 }}
                    />
                </Stack>

                {/* Description */}
                {task.taskDescription && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                        {task.taskDescription}
                    </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                {/* Meta info */}
                <Stack spacing={0.5}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="text.disabled">User:</Typography>
                        <Typography variant="caption" fontWeight={600}>{task.userName}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Typography variant="caption" color="text.disabled">Status:</Typography>
                            <Typography variant="caption" fontWeight={600}>{task.status}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Typography variant="caption" color="text.disabled">ID:</Typography>
                            <Typography variant="caption" fontWeight={600}>#{task.id}</Typography>
                        </Stack>
                    </Stack>
                </Stack>

                {/* Comment */}
                <TextField
                    fullWidth
                    size="small"
                    placeholder={t('dialog.addComment')}
                    value={comment}
                    onChange={(e) => onCommentChange(task.id, e.target.value)}
                    multiline
                    maxRows={3}
                    sx={{ mt: 1.5 }}
                />
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2, pt: 0.5, gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => onViewDetail(task)}
                        sx={{ borderRadius: 2 }}
                    >
                        {t('dialog.view')}
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button
                        size="small"
                        variant={reviewStatus === 'APPROVED' ? 'contained' : 'outlined'}
                        color="success"
                        startIcon={<ThumbUpIcon />}
                        onClick={() => onApprove(task.id)}
                        sx={{ borderRadius: 2 }}
                    >
                        {t('dialog.approve')}
                    </Button>
                    <Button
                        size="small"
                        variant={reviewStatus === 'REJECT' ? 'contained' : 'outlined'}
                        color="error"
                        startIcon={<ThumbDownIcon />}
                        onClick={() => onReject(task.id)}
                        sx={{ borderRadius: 2 }}
                    >
                        {t('dialog.reject')}
                    </Button>
                </Box>
            </CardActions>
        </Card>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function TaskSessionReviewDataGrid({ tasks, onSave }: TaskSessionReviewDataGridProps) {
    const [reviewStates, setReviewStates] = useState<ReviewState>({});
    const [comments, setComments] = useState<CommentState>({});
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleApprove = (sessionId: number) => {
        setReviewStates(prev => ({
            ...prev,
            [sessionId]: prev[sessionId] === 'APPROVED' ? null : 'APPROVED'
        }));
    };

    const handleReject = (sessionId: number) => {
        setReviewStates(prev => ({
            ...prev,
            [sessionId]: prev[sessionId] === 'REJECT' ? null : 'REJECT'
        }));
    };

    const handleCommentChange = (sessionId: number, comment: string) => {
        setComments(prev => ({
            ...prev,
            [sessionId]: comment
        }));
    };

    const handleViewDetail = (task: TaskRow) => {
        setSelectedTask(task);
        setDetailDialogOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailDialogOpen(false);
        setSelectedTask(null);
    };

    const column: GridColDef<TaskRow>[] = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'taskTitle', headerName: 'Task Name', width: 200 },
        { field: 'taskDescription', headerName: 'Task Description', width: 220 },
        { field: 'userName', headerName: 'User', width: 130 },
        { field: 'status', headerName: 'Status', width: 120 },
        {
            field: 'detail',
            headerName: 'Detail',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetail(params.row)}
                >
                    {t('dialog.view')}
                </Button>
            )
        },
        {
            field: 'comment',
            headerName: 'Comment',
            width: 220,
            sortable: false,
            renderCell: (params) => (
                <TextField
                    fullWidth
                    size="small"
                    placeholder={t('dialog.addComment')}
                    value={comments[params.row.id] || ''}
                    onChange={(e) => handleCommentChange(params.row.id, e.target.value)}
                    multiline
                    maxRows={2}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 240,
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
    ], [reviewStates, comments, t]);

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
                managerComment: comments[Number(sessionId)] || ''
            }));

        if (reviews.length > 0 && onSave) {
            onSave(reviews);
        }
    };

    return (
        <>
            {/* ── Mobile: Card List ── */}
            {isMobile ? (
                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {tasks.length === 0 ? (
                        <ListItem sx={{ justifyContent: 'center', py: 6 }}>
                            <Typography color="text.secondary">ไม่มีรายการ</Typography>
                        </ListItem>
                    ) : (
                        (tasks as unknown as TaskRow[]).map((task) => (
                            <ListItem key={task.id} disablePadding sx={{ width: '100%' }}>
                                <ReviewCardItem
                                    task={task}
                                    reviewStatus={reviewStates[task.id] ?? null}
                                    comment={comments[task.id] || ''}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onCommentChange={handleCommentChange}
                                    onViewDetail={handleViewDetail}
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            ) : (
                /* ── Desktop: DataGrid ── */
                <Box sx={{ width: '100%' }}>
                    <DataGrid
                        rows={tasks as unknown as TaskRow[]}
                        columns={column}
                        autoHeight
                        disableRowSelectionOnClick
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10, page: 0 } },
                        }}
                        sx={{ borderRadius: 2, backgroundColor: 'background.paper' }}
                    />
                </Box>
            )}

            {/* ── Detail Dialog ── */}
            <Dialog
                open={detailDialogOpen}
                onClose={handleCloseDetail}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Task Detail</Typography>
                        <IconButton onClick={handleCloseDetail} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedTask && (
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Task Name</Typography>
                                <Typography variant="body1">{selectedTask.taskTitle}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                <Typography variant="body1">{selectedTask.taskDescription || '-'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                <Typography variant="body1">{selectedTask.status}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">User</Typography>
                                <Typography variant="body1">{selectedTask.userName}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Attachments ({selectedTask.attachments.length})
                                </Typography>
                                {selectedTask.attachments.length > 0 ? (
                                    <ImageList cols={isMobile ? 2 : 3} gap={8}>
                                        {selectedTask.attachments.map((attachment) => (
                                            <ImageListItem key={attachment.attachmentId}>
                                                <img
                                                    src={attachment.attachmentUrl}
                                                    alt={`Attachment ${attachment.attachmentId}`}
                                                    loading="lazy"
                                                    style={{
                                                        width: '100%',
                                                        height: isMobile ? '140px' : '200px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            </ImageListItem>
                                        ))}
                                    </ImageList>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No attachments</Typography>
                                )}
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetail} variant="contained" fullWidth={isMobile}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Summary Section ── */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                    {t('taskReview.title')}
                </Typography>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 1.5, sm: 3 }}
                    sx={{ mb: 2 }}
                    flexWrap="wrap"
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body2">
                            {t('dialog.approved')}: <strong>{summary.approved}</strong>
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CancelIcon color="error" fontSize="small" />
                        <Typography variant="body2">
                            {t('dialog.rejected')}: <strong>{summary.rejected}</strong>
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Pending: <strong>{summary.pending}</strong>
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">
                            Total: <strong>{summary.total}</strong>
                        </Typography>
                    </Stack>
                </Stack>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={summary.approved === 0 && summary.rejected === 0}
                    fullWidth={isMobile}
                >
                    {t('dialog.saveReview')}
                </Button>
            </Box>
        </>
    );
}