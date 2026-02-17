"use client";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    DialogContentText,
    CircularProgress,
} from "@mui/material";
import { User } from "@/services/api/user.service";
import { useDeleteUser } from "@/hooks/api/useUser";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/hooks/useNotification";

interface DeleteUserDialogProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
}

export default function DeleteUserDialog({ open, user, onClose }: DeleteUserDialogProps) {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const deleteUserMutation = useDeleteUser();

    const handleConfirm = async () => {
        if (!user) return;

        try {
            await deleteUserMutation.mutateAsync(user.id);
            showNotification(t('users.deleteSuccess'), "success");
            onClose();
        } catch (error) {
            showNotification(
                t('users.deleteError', { 
                    message: error instanceof Error ? error.message : 'Unknown error' 
                }),
                "error"
            );
        }
    };

    const handleClose = () => {
        if (!deleteUserMutation.isPending) {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 600 }}>
                {t('users.confirmDelete')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('users.confirmDeleteMessage', { username: user?.username || '' })}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                    onClick={handleClose} 
                    disabled={deleteUserMutation.isPending}
                >
                    {t('common.cancel')}
                </Button>
                <Button
                    onClick={handleConfirm}
                    color="error"
                    variant="contained"
                    disabled={deleteUserMutation.isPending}
                    startIcon={deleteUserMutation.isPending ? <CircularProgress size={16} /> : null}
                >
                    {deleteUserMutation.isPending ? t('common.deleting') : t('common.delete')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
