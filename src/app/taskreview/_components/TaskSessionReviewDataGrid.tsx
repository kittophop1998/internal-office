import { TaskSessionItem } from "@/services/api/tasksession.service";
import {
    Box, Button, Stack, Typography,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, ImageList, ImageListItem,
    Card, CardContent, Chip, Divider,
    List, ListItem, useMediaQuery, useTheme, Skeleton, alpha,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SaveIcon from '@mui/icons-material/Save';

interface TaskSessionReviewDataGridProps {
    tasks: TaskSessionItem[];
    onSave?: (reviews: { sessionId: number; status: string; managerComment?: string }[]) => void;
    isLoading?: boolean;
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

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function ReviewCardSkeleton() {
    return (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', width: '100%', overflow: 'hidden' }}>
            <CardContent sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Skeleton variant="text" width="60%" height={28} />
                    <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 10 }} />
                </Stack>
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="70%" />
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={0.5}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="50%" />
                </Stack>
                <Skeleton variant="rounded" height={60} sx={{ mt: 1.5, borderRadius: 2 }} />
            </CardContent>
            <Box sx={{ px: 2, pb: 2, pt: 0.5, display: 'flex', gap: 1 }}>
                <Skeleton variant="rounded" width={100} height={38} sx={{ borderRadius: 2 }} />
                <Box sx={{ flex: 1 }} />
                <Skeleton variant="rounded" width={100} height={38} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rounded" width={100} height={38} sx={{ borderRadius: 2 }} />
            </Box>
        </Card>
    );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState() {
    const { t } = useTranslation();
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                gap: 2,
            }}
        >
            <Box
                sx={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <TaskAltIcon sx={{ fontSize: 52, color: 'success.main' }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="text.primary">
                {t('taskReview.emptyTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 300 }}>
                {t('taskReview.emptySubtitle')}
            </Typography>
        </Box>
    );
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
    const theme = useTheme();

    const borderColor = reviewStatus === 'APPROVED'
        ? theme.palette.success.light
        : reviewStatus === 'REJECT'
            ? theme.palette.error.light
            : theme.palette.divider;

    const bgColor = reviewStatus === 'APPROVED'
        ? alpha(theme.palette.success.main, 0.04)
        : reviewStatus === 'REJECT'
            ? alpha(theme.palette.error.main, 0.04)
            : theme.palette.background.paper;

    const pendingBadgeSx = {
        bgcolor: alpha(theme.palette.warning.main, 0.12),
        color: theme.palette.warning.dark,
        fontWeight: 700,
        fontSize: '0.7rem',
        border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
    };

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '2px solid',
                borderColor,
                backgroundColor: bgColor,
                width: '100%',
                overflow: 'hidden',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
            }}
        >
            <CardContent sx={{ pb: 1, px: 2.5, pt: 2.5 }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 0.75 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1, lineHeight: 1.3 }}>
                        {task.taskTitle}
                    </Typography>
                    {reviewStatus === null ? (
                        <Chip
                            icon={<HourglassEmptyIcon sx={{ fontSize: '0.8rem !important' }} />}
                            label="Pending"
                            size="small"
                            sx={{ ...pendingBadgeSx, flexShrink: 0 }}
                        />
                    ) : reviewStatus === 'APPROVED' ? (
                        <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} />}
                            label={t('dialog.approved')}
                            size="small"
                            color="success"
                            variant="filled"
                            sx={{ fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}
                        />
                    ) : (
                        <Chip
                            icon={<CancelIcon sx={{ fontSize: '0.85rem !important' }} />}
                            label={t('dialog.rejected')}
                            size="small"
                            color="error"
                            variant="filled"
                            sx={{ fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}
                        />
                    )}
                </Stack>

                {/* Description */}
                {task.taskDescription && (
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        {task.taskDescription}
                    </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                {/* Meta info */}
                <Stack direction="row" spacing={3} flexWrap="wrap">
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <PersonIcon sx={{ fontSize: '0.95rem', color: 'text.disabled' }} />
                        <Typography variant="caption" fontWeight={600} color="text.primary">{task.userName}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <BadgeIcon sx={{ fontSize: '0.95rem', color: 'text.disabled' }} />
                        <Typography variant="caption" fontWeight={600} color="text.secondary">#{task.userId}</Typography>
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
                    minRows={2}
                    maxRows={4}
                    sx={{
                        mt: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: '0.875rem',
                        },
                    }}
                />
            </CardContent>

            {/* Actions */}
            <Box sx={{ px: 2.5, pb: 2.5, pt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                    size="small"
                    variant="text"
                    startIcon={<VisibilityIcon />}
                    onClick={() => onViewDetail(task)}
                    sx={{ borderRadius: 2, color: 'text.secondary', px: 1.5 }}
                >
                    {t('dialog.view')}
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button
                    variant={reviewStatus === 'APPROVED' ? 'contained' : 'outlined'}
                    color="success"
                    startIcon={<ThumbUpIcon />}
                    onClick={() => onApprove(task.id)}
                    sx={{
                        borderRadius: 2.5,
                        px: 2,
                        py: 0.75,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        minWidth: 100,
                        ...(reviewStatus === 'APPROVED' && {
                            background: (theme) => `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                            boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.success.main, 0.4)}`,
                        }),
                    }}
                >
                    {t('dialog.approve')}
                </Button>
                <Button
                    variant={reviewStatus === 'REJECT' ? 'contained' : 'outlined'}
                    color="error"
                    startIcon={<ThumbDownIcon />}
                    onClick={() => onReject(task.id)}
                    sx={{
                        borderRadius: 2.5,
                        px: 2,
                        py: 0.75,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        minWidth: 100,
                        ...(reviewStatus === 'REJECT'
                            ? {
                                bgcolor: '#e57373',
                                borderColor: '#e57373',
                                color: '#fff',
                                '&:hover': { bgcolor: '#ef5350' },
                                boxShadow: '0 4px 14px rgba(211,54,54,0.35)',
                            }
                            : {
                                borderColor: 'error.light',
                                color: 'error.main',
                                '&:hover': {
                                    borderColor: 'error.main',
                                    bgcolor: 'rgba(211,47,47,0.06)',
                                },
                            }),
                    }}
                >
                    {t('dialog.reject')}
                </Button>
            </Box>
        </Card>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function TaskSessionReviewDataGrid({ tasks, onSave, isLoading = false }: TaskSessionReviewDataGridProps) {
    const [reviewStates, setReviewStates] = useState<ReviewState>({});
    const [comments, setComments] = useState<CommentState>({});
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => {
                const s = reviewStates[params.row.id];
                if (s === 'APPROVED') return <Chip label={t('dialog.approved')} color="success" size="small" icon={<CheckCircleIcon />} sx={{ fontWeight: 700 }} />;
                if (s === 'REJECT') return <Chip label={t('dialog.rejected')} color="error" size="small" icon={<CancelIcon />} sx={{ fontWeight: 700 }} />;
                return (
                    <Chip
                        label="Pending"
                        size="small"
                        icon={<HourglassEmptyIcon />}
                        sx={{
                            bgcolor: alpha(theme.palette.warning.main, 0.12),
                            color: theme.palette.warning.dark,
                            fontWeight: 700,
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                        }}
                    />
                );
            }
        },
        {
            field: 'detail',
            headerName: 'Detail',
            width: 130,
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetail(params.row)}
                    sx={{ borderRadius: 2 }}
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
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                            {t('dialog.approve')}
                        </Button>
                        <Button
                            variant={currentStatus === 'REJECT' ? 'contained' : 'outlined'}
                            color="error"
                            size="small"
                            startIcon={<ThumbDownIcon />}
                            onClick={() => handleReject(params.row.id)}
                            sx={{
                                borderRadius: 2, fontWeight: 700,
                                ...(currentStatus !== 'REJECT' && {
                                    borderColor: theme.palette.error.light,
                                    color: 'error.main',
                                }),
                            }}
                        >
                            {t('dialog.reject')}
                        </Button>
                    </Stack>
                );
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const summaryCard = (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'primary.main',
                overflow: 'hidden',
                background: (theme) =>
                    `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.08)} 100%)`,
            }}
        >
            <CardContent sx={{ px: 3, py: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
                    {t('taskReview.summaryTitle')}
                </Typography>

                {/* 2×2 grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 1.5,
                        mb: 2.5,
                    }}
                >
                    {/* Approved */}
                    <Box
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2, py: 1.5,
                            borderRadius: 2.5,
                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                            border: '1px solid',
                            borderColor: (theme) => alpha(theme.palette.success.main, 0.25),
                        }}
                    >
                        <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.6rem' }} />
                        <Box>
                            <Typography variant="h5" fontWeight={800} color="success.main" lineHeight={1}>{summary.approved}</Typography>
                            <Typography variant="caption" color="success.dark" fontWeight={600}>{t('dialog.approved')}</Typography>
                        </Box>
                    </Box>

                    {/* Rejected */}
                    <Box
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2, py: 1.5,
                            borderRadius: 2.5,
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                            border: '1px solid',
                            borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
                        }}
                    >
                        <CancelIcon sx={{ color: '#e57373', fontSize: '1.6rem' }} />
                        <Box>
                            <Typography variant="h5" fontWeight={800} sx={{ color: '#e57373' }} lineHeight={1}>{summary.rejected}</Typography>
                            <Typography variant="caption" sx={{ color: '#e57373', fontWeight: 600 }}>{t('dialog.rejected')}</Typography>
                        </Box>
                    </Box>

                    {/* Pending */}
                    <Box
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2, py: 1.5,
                            borderRadius: 2.5,
                            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                            border: '1px solid',
                            borderColor: (theme) => alpha(theme.palette.warning.main, 0.25),
                        }}
                    >
                        <HourglassEmptyIcon sx={{ color: 'warning.main', fontSize: '1.6rem' }} />
                        <Box>
                            <Typography variant="h5" fontWeight={800} color="warning.main" lineHeight={1}>{summary.pending}</Typography>
                            <Typography variant="caption" color="warning.dark" fontWeight={600}>Pending</Typography>
                        </Box>
                    </Box>

                    {/* Total */}
                    <Box
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2, py: 1.5,
                            borderRadius: 2.5,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                            border: '1px solid',
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                        }}
                    >
                        <TaskAltIcon sx={{ color: 'primary.main', fontSize: '1.6rem' }} />
                        <Box>
                            <Typography variant="h5" fontWeight={800} color="primary.main" lineHeight={1}>{summary.total}</Typography>
                            <Typography variant="caption" color="primary.main" fontWeight={600}>{t('taskReview.totalTasks')}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleSave}
                    disabled={summary.approved === 0 && summary.rejected === 0}
                    startIcon={<SaveIcon />}
                    fullWidth
                    sx={{
                        borderRadius: 2.5,
                        px: 4,
                        py: 1.25,
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                        boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                        '&:hover': {
                            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
                            transform: 'translateY(-1px)',
                        },
                        '&:active': { transform: 'translateY(0)' },
                        '&.Mui-disabled': { opacity: 0.5 },
                        transition: 'all 0.25s ease',
                    }}
                >
                    {t('dialog.saveReview')}
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <>
            {/* ── Mobile: Card List / Skeleton ── */}
            {isMobile ? (
                isLoading ? (
                    <Stack spacing={1.5}>
                        {[1, 2, 3].map((i) => <ReviewCardSkeleton key={i} />)}
                    </Stack>
                ) : tasks.length === 0 ? (
                    <EmptyState />
                ) : (
                    <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {(tasks as unknown as TaskRow[]).map((task) => (
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
                        ))}
                    </List>
                )
            ) : (
                /* ── Desktop: DataGrid ── */
                <Box sx={{ width: '100%' }}>
                    {isLoading ? (
                        <Stack spacing={1}>
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 1 }} />
                            ))}
                        </Stack>
                    ) : tasks.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <DataGrid
                            rows={tasks as unknown as TaskRow[]}
                            columns={column}
                            autoHeight
                            disableRowSelectionOnClick
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10, page: 0 } },
                            }}
                            sx={{
                                borderRadius: 2,
                                backgroundColor: 'background.paper',
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                    fontWeight: 700,
                                },
                                '& .MuiDataGrid-row:hover': {
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                                },
                            }}
                        />
                    )}
                </Box>
            )}

            {/* ── Detail Dialog ── */}
            <Dialog
                open={detailDialogOpen}
                onClose={handleCloseDetail}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
            >
                <DialogTitle sx={{ px: 3, py: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700}>Task Detail</Typography>
                        <IconButton onClick={handleCloseDetail} size="small" sx={{ borderRadius: 2 }}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers sx={{ px: 3 }}>
                    {selectedTask && (
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>Task Name</Typography>
                                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>{selectedTask.taskTitle}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>Description</Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>{selectedTask.taskDescription || '-'}</Typography>
                            </Box>
                            <Stack direction="row" spacing={4}>
                                <Box>
                                    <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>Status</Typography>
                                    <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>{selectedTask.status}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>User</Typography>
                                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
                                        <PersonIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                        <Typography variant="body1" fontWeight={600}>{selectedTask.userName}</Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                            <Box>
                                <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={0.5} gutterBottom display="block">
                                    Attachments ({selectedTask.attachments.length})
                                </Typography>
                                {selectedTask.attachments.length > 0 ? (
                                    <ImageList cols={isMobile ? 2 : 3} gap={8} sx={{ mt: 0.5 }}>
                                        {selectedTask.attachments.map((attachment) => (
                                            <ImageListItem key={attachment.attachmentId} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={attachment.attachmentUrl}
                                                    alt={`Attachment ${attachment.attachmentId}`}
                                                    loading="lazy"
                                                    style={{
                                                        width: '100%',
                                                        height: isMobile ? '140px' : '200px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
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
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={handleCloseDetail}
                        variant="contained"
                        fullWidth={isMobile}
                        sx={{ borderRadius: 2.5, px: 3, fontWeight: 700 }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Summary (bottom) ── */}
            {tasks.length > 0 && !isLoading && (
                <Box sx={{ mt: 3 }}>
                    {summaryCard}
                </Box>
            )}
        </>
    );
}
