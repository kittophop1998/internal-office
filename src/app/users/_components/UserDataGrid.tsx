"use client";

import { useCallback, useMemo, useState } from "react";
import {
    Box,
    Button,
    Stack,
    Chip,
    Card,
    CardContent,
    CardActions,
    Typography,
    Divider,
    List,
    ListItem,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { User } from "@/services/api/user.service";
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import { useTranslation } from "react-i18next";

interface UserDataGridProps {
    users: User[];
}

// ─── Mobile Card Item ─────────────────────────────────────────────────────────
interface UserCardItemProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    t: (key: string) => string;
}

function UserCardItem({ user, onEdit, onDelete, t }: UserCardItemProps) {
    const roleColors: Record<string, "primary" | "success" | "default"> = {
        admin: "primary",
        manager: "success",
        staff: "default",
    };

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
                        {user.fullName}
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexShrink={0}>
                        {user.roleName && (
                            <Chip
                                label={user.roleName}
                                size="small"
                                color={roleColors[user.roleName] || "default"}
                                variant="outlined"
                                sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                            />
                        )}
                        <Chip
                            label={user.isActive ? t("users.active") : t("users.inactive")}
                            size="small"
                            color={user.isActive ? "success" : "default"}
                            sx={{ fontSize: "0.7rem" }}
                        />
                    </Stack>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    @{user.username}
                </Typography>

                {user.email && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {user.email}
                    </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" spacing={2} flexWrap="wrap">
                    {user.telephone && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Typography variant="caption" color="text.disabled">{t("users.telephone")}:</Typography>
                            <Typography variant="caption" fontWeight={600}>{user.telephone}</Typography>
                        </Stack>
                    )}
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="text.disabled">ID:</Typography>
                        <Typography variant="caption" fontWeight={600}>#{user.id}</Typography>
                    </Stack>
                </Stack>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2, pt: 0.5, gap: 1 }}>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(user)}
                    sx={{ flex: 1, borderRadius: 2 }}
                >
                    {t("common.edit")}
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDelete(user)}
                    sx={{ flex: 1, borderRadius: 2 }}
                >
                    {t("common.delete")}
                </Button>
            </CardActions>
        </Card>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function UserDataGrid({ users }: UserDataGridProps) {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleEditClick = useCallback((user: User) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    }, []);

    const handleDeleteClick = useCallback((user: User) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    }, []);

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setSelectedUser(null);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedUser(null);
    };

    const columns: GridColDef<User>[] = useMemo(
        () => [
            {
                field: "id",
                headerName: "ID",
                width: 80,
            },
            {
                field: "username",
                headerName: t('users.username'),
                width: 130,
            },
            {
                field: "fullName",
                headerName: t('users.fullname'),
                flex: 1,
                minWidth: 180,
            },
            {
                field: "email",
                headerName: t('users.email'),
                flex: 1,
                minWidth: 200,
            },
            {
                field: "telephone",
                headerName: t('users.telephone'),
                width: 130,
            },
            {
                field: "roleName",
                headerName: t('users.role'),
                width: 120,
                renderCell: (params) => {
                    const role = params.value as string | null;
                    if (!role) return "-";
                    
                    const roleColors: Record<string, "primary" | "success" | "default"> = {
                        admin: "primary",
                        manager: "success",
                        staff: "default",
                    };
                    
                    return (
                        <Chip 
                            label={role} 
                            size="small" 
                            color={roleColors[role] || "default"}
                        />
                    );
                },
            },
            {
                field: "isActive",
                headerName: t('users.status'),
                width: 110,
                renderCell: (params) => (
                    <Chip
                        label={params.value ? t('users.active') : t('users.inactive')}
                        size="small"
                        color={params.value ? "success" : "default"}
                    />
                ),
            },
            {
                field: "actions",
                headerName: t('users.actions'),
                width: 180,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEditClick(params.row)}
                        >
                            {t('common.edit')}
                        </Button>
                        <Button
                            size="small"
                            color="error"
                            variant="contained"
                            onClick={() => handleDeleteClick(params.row)}
                        >
                            {t('common.delete')}
                        </Button>
                    </Stack>
                ),
            },
        ],
        [t, handleEditClick, handleDeleteClick]
    );

    return (
        <>
            {isMobile ? (
                <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {users.length === 0 ? (
                        <ListItem sx={{ justifyContent: "center", py: 6 }}>
                            <Typography color="text.secondary">ไม่มีรายการ</Typography>
                        </ListItem>
                    ) : (
                        users.map((user) => (
                            <ListItem key={user.id} disablePadding sx={{ width: "100%" }}>
                                <UserCardItem
                                    user={user}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick}
                                    t={t}
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            ) : (
                <Box sx={{ height: 600, width: "100%" }}>
                    <DataGrid
                        rows={users}
                        columns={columns}
                        disableRowSelectionOnClick
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10, page: 0 } },
                        }}
                        sx={{
                            borderRadius: 2,
                            backgroundColor: "background.paper",
                            "& .MuiDataGrid-cell:focus": {
                                outline: "none",
                            },
                            "& .MuiDataGrid-cell:focus-within": {
                                outline: "none",
                            },
                        }}
                    />
                </Box>
            )}

            <EditUserDialog
                open={editDialogOpen}
                user={selectedUser}
                onClose={handleCloseEditDialog}
            />

            <DeleteUserDialog
                open={deleteDialogOpen}
                user={selectedUser}
                onClose={handleCloseDeleteDialog}
            />
        </>
    );
}
