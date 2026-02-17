"use client";

import { useCallback, useMemo, useState } from "react";
import { Box, Button, Stack, Chip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { User } from "@/services/api/user.service";
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import { useTranslation } from "react-i18next";

interface UserDataGridProps {
    users: User[];
}

export default function UserDataGrid({ users }: UserDataGridProps) {
    const { t } = useTranslation();
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
                field: "fullname",
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
                        "& .MuiDataGrid-cell:focus": {
                            outline: "none",
                        },
                        "& .MuiDataGrid-cell:focus-within": {
                            outline: "none",
                        },
                    }}
                />
            </Box>

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
