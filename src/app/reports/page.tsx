"use client";

import { MainLayout } from "@/components/layouts";
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Alert,
    Chip,
    Divider,
    Card,
    CardContent,
    List,
    ListItem,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUsers } from "@/hooks/api/useUser";
import { useUserReport } from "@/hooks/api/useReport";
import { TaskReport, ReportType, ReportService } from "@/services/api/report.service";
import { useMasterBranches } from "@/hooks/api/useMaster";

const RATING_ROWS = [
    { rate: 5, labelKey: "rate5", highlight: false },
    { rate: 4, labelKey: "rate4", highlight: false },
    { rate: 3, labelKey: "rate3", highlight: true },
    { rate: 2, labelKey: "rate2", highlight: false },
    { rate: 1, labelKey: "rate1", highlight: false },
];

// ─── Mobile Task Report Card ──────────────────────────────────────────────────
interface TaskReportCardProps {
    task: TaskReport;
    index: number;
    t: (key: string) => string;
}

function TaskReportCard({ task, index, t }: TaskReportCardProps) {
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
            <CardContent sx={{ pb: 1.5 }}>
                {/* Task Name */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1, lineHeight: 1.4 }}>
                        {index + 1}. {task.name}
                    </Typography>
                    <Chip
                        label={`${task.weight}%`}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: 600, fontSize: "0.7rem", flexShrink: 0 }}
                    />
                </Stack>

                <Divider sx={{ my: 1 }} />

                {/* Rating & Score */}
                <Stack direction="row" spacing={3}>
                    <Stack spacing={0.25}>
                        <Typography variant="caption" color="text.disabled" fontWeight={500}>
                            {t("reports.rating")}
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {task.rating}
                        </Typography>
                    </Stack>
                    <Stack spacing={0.25}>
                        <Typography variant="caption" color="text.disabled" fontWeight={500}>
                            {t("reports.score")}
                        </Typography>
                        <Typography variant="body1" fontWeight={700} color="primary">
                            {Number(task.score).toFixed(2)}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [selectedBranchId, setSelectedBranchId] = useState<string>("");
    const [selectedType, setSelectedType] = useState<ReportType | "ALL">("ALL");
    const [queryParams, setQueryParams] = useState<{ userId: string; branchId: string; type?: ReportType } | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const { data: users, isLoading: usersLoading } = useUsers();
    const { data: branches, isLoading: branchesLoading } = useMasterBranches();
    const {
        data: report,
        isLoading: reportLoading,
        isError,
        error,
    } = useUserReport(
        { userId: queryParams?.userId ?? "", branchId: queryParams?.branchId ?? "", type: queryParams?.type },
        { enabled: !!queryParams?.userId && !!queryParams?.branchId }
    );

    const handleViewReport = () => {
        if (!selectedUserId || !selectedBranchId) return;
        setQueryParams({
            userId: selectedUserId,
            branchId: selectedBranchId,
            type: selectedType === "ALL" ? undefined : selectedType,
        });
    };

    const handleExportPdf = async () => {
        if (!selectedUserId || !selectedBranchId) return;
        setPdfLoading(true);
        setPdfError(null);
        try {
            const blob = await ReportService.exportPdf({
                userId: selectedUserId,
                branchId: selectedBranchId,
                type: selectedType === "ALL" ? undefined : selectedType,
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `report_${selectedUserId}_${selectedBranchId}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setPdfError(err instanceof Error ? err.message : t("common.error"));
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <MainLayout title={t("reports.pageTitle")} showBackButton backUrl="/dashboard">
            <Stack spacing={3} sx={{ pb: 4 }}>
                {/* Page Header */}
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        {t("reports.title")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("reports.subtitle")}
                    </Typography>
                </Box>

                {/* Rating Score Definition Card */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <InfoOutlinedIcon fontSize="small" color="info" />
                        <Typography variant="subtitle1" fontWeight={600}>
                            {t("reports.ratingScoreDefinition")}
                        </Typography>
                    </Stack>
                    <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                            {t("reports.instructionTitle")}:&nbsp;
                            {t("reports.instruction1")}&nbsp;|&nbsp;
                            {t("reports.instruction2")}&nbsp;|&nbsp;
                            {t("reports.instruction3")}
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableBody>
                                    {RATING_ROWS.map(({ rate, labelKey, highlight }) => (
                                        <TableRow key={rate} sx={{ bgcolor: highlight ? "warning.light" : undefined }}>
                                            <TableCell sx={{ fontWeight: 700, width: 70, color: highlight ? "warning.dark" : undefined }}>
                                                Rate {rate}
                                            </TableCell>
                                            <TableCell sx={{ color: highlight ? "warning.dark" : undefined, fontWeight: highlight ? 700 : undefined }}>
                                                {t(`reports.${labelKey}`)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                </Paper>

                {/* User Selector */}
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                        {t("reports.tasksSection")}
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "flex-end" }} flexWrap="wrap">
                        {/* User */}
                        <FormControl size="small" sx={{ minWidth: 240, flex: { sm: 1 } }}>
                            <InputLabel id="user-select-label">{t("reports.selectUser")}</InputLabel>
                            <Select
                                labelId="user-select-label"
                                value={selectedUserId}
                                label={t("reports.selectUser")}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                disabled={usersLoading}
                            >
                                <MenuItem value="">
                                    <em>{t("reports.selectUserPlaceholder")}</em>
                                </MenuItem>
                                {users?.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.fullName}
                                        {user.positionTitle && (
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                ({user.positionTitle})
                                            </Typography>
                                        )}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Branch */}
                        <FormControl size="small" sx={{ minWidth: 200, flex: { sm: 1 } }}>
                            <InputLabel id="branch-select-label">{t("reports.selectBranch")}</InputLabel>
                            <Select
                                labelId="branch-select-label"
                                value={selectedBranchId}
                                label={t("reports.selectBranch")}
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                                disabled={branchesLoading}
                            >
                                <MenuItem value="">
                                    <em>{t("reports.selectBranchPlaceholder")}</em>
                                </MenuItem>
                                {branches?.map((branch) => (
                                    <MenuItem key={branch.id} value={String(branch.id)}>
                                        {branch.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Type */}
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel id="type-select-label">{t("reports.selectType")}</InputLabel>
                            <Select
                                labelId="type-select-label"
                                value={selectedType}
                                label={t("reports.selectType")}
                                onChange={(e) => setSelectedType(e.target.value as ReportType | "ALL")}
                            >
                                <MenuItem value="ALL">{t("reports.typeAll")}</MenuItem>
                                <MenuItem value="DAILY">{t("reports.typeDaily")}</MenuItem>
                                <MenuItem value="WEEKLY">{t("reports.typeWeekly")}</MenuItem>
                                <MenuItem value="MONTHLY">{t("reports.typeMonthly")}</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            startIcon={<AssessmentIcon />}
                            onClick={handleViewReport}
                            disabled={!selectedUserId || !selectedBranchId || reportLoading}
                            sx={{ borderRadius: 2, px: 3, fontWeight: 600, height: 40, flexShrink: 0 }}
                        >
                            {reportLoading ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CircularProgress size={16} color="inherit" />
                                    <span>{t("common.loading")}</span>
                                </Stack>
                            ) : (
                                t("reports.viewReport")
                            )}
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={pdfLoading ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfIcon />}
                            onClick={handleExportPdf}
                            disabled={!selectedUserId || !selectedBranchId || pdfLoading}
                            sx={{ borderRadius: 2, px: 3, fontWeight: 600, height: 40, flexShrink: 0 }}
                        >
                            {pdfLoading ? t("common.loading") : t("reports.exportPdf")}
                        </Button>
                    </Stack>
                </Paper>

                {/* Error */}
                {isError && (
                    <Alert severity="error">{error?.message ?? t("common.error")}</Alert>
                )}
                {pdfError && (
                    <Alert severity="error" onClose={() => setPdfError(null)}>{pdfError}</Alert>
                )}

                {/* Report Table */}
                {report ? (
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                        {/* Employee Name Header */}
                        <Box sx={{ px: 3, py: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
                            <Typography variant="h6" fontWeight={700}>
                                {report.name}
                            </Typography>
                        </Box>

                        <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                            {isMobile ? (
                                /* ── Mobile: Card List ── */
                                <Stack spacing={0}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, px: 0.5 }}>
                                        {t("reports.criticalTasksTable")}
                                    </Typography>
                                    <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                        {report.tasksReports.length === 0 ? (
                                            <ListItem sx={{ justifyContent: "center", py: 6 }}>
                                                <Typography color="text.secondary">{t("reports.noData")}</Typography>
                                            </ListItem>
                                        ) : (
                                            report.tasksReports.map((task, index) => (
                                                <ListItem key={index} disablePadding sx={{ width: "100%" }}>
                                                    <TaskReportCard task={task} index={index} t={t} />
                                                </ListItem>
                                            ))
                                        )}
                                    </List>

                                    {/* Overall Summary Card */}
                                    <Card
                                        elevation={0}
                                        sx={{
                                            mt: 2,
                                            borderRadius: 3,
                                            border: "2px solid",
                                            borderColor: "primary.main",
                                            bgcolor: "primary.50",
                                        }}
                                    >
                                        <CardContent>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Stack spacing={0.5}>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                        {t("reports.weight")} Total
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={700}>
                                                        {report.overall_crittical_task_rating.percent}%
                                                    </Typography>
                                                </Stack>
                                                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                                                <Stack spacing={0.5} alignItems="flex-end">
                                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                        {t("reports.overallCriticalTaskRating")}
                                                    </Typography>
                                                    <Typography variant="h5" fontWeight={800} color="primary">
                                                        {report.overall_crittical_task_rating.rating}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Stack>
                            ) : (
                                /* ── Desktop: Table ── */
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: "grey.800" }}>
                                                <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                                                    {t("reports.criticalTasksTable")}
                                                </TableCell>
                                                <TableCell align="center" sx={{ color: "#fff", fontWeight: 700, width: 100 }}>
                                                    {t("reports.weight")}
                                                </TableCell>
                                                <TableCell align="center" sx={{ color: "#fff", fontWeight: 700, width: 80 }}>
                                                    {t("reports.rating")}
                                                </TableCell>
                                                <TableCell align="center" sx={{ color: "#fff", fontWeight: 700, width: 90 }}>
                                                    {t("reports.score")}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {report.tasksReports.map((task, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{
                                                        "&:nth-of-type(odd)": { bgcolor: "action.hover" },
                                                        "&:last-child td": { border: 0 },
                                                    }}
                                                >
                                                    <TableCell>{task.name}</TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={`${task.weight}%`}
                                                            size="small"
                                                            variant="outlined"
                                                            color="primary"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography fontWeight={600}>{task.rating}</Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography fontWeight={600} color="primary">
                                                            {Number(task.score).toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                            {/* Overall Row */}
                                            <TableRow sx={{ bgcolor: "grey.200" }}>
                                                <TableCell colSpan={2} align="right">
                                                    <Typography fontWeight={700} variant="body2">
                                                        {report.overall_crittical_task_rating.percent}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell colSpan={2}>
                                                    {/* empty */}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow sx={{ bgcolor: "grey.300" }}>
                                                <TableCell colSpan={3} align="right">
                                                    <Typography fontWeight={700}>
                                                        {t("reports.overallCriticalTaskRating")}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="h6" fontWeight={800} color="primary">
                                                        {report.overall_crittical_task_rating.rating}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </Paper>
                ) : (
                    !reportLoading && (
                        <Paper variant="outlined" sx={{ p: 5, borderRadius: 2, textAlign: "center" }}>
                            <AssessmentIcon sx={{ fontSize: 64, color: "text.disabled", mb: 1 }} />
                            <Typography color="text.secondary">{t("reports.noData")}</Typography>
                        </Paper>
                    )
                )}
            </Stack>
        </MainLayout>
    );
}
