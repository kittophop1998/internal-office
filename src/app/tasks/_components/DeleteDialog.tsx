"use client";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface DeleteTaskDialogProps {
    open: boolean;
    taskTitle: string;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteTaskDialog({
    open,
    taskTitle,
    loading,
    onClose,
    onConfirm,
}: DeleteTaskDialogProps) {
    const { t } = useTranslation();
    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t('dialog.confirmDelete')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary">
                    {t('dialog.confirmDeleteMessage', { title: taskTitle })}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    {t('common.cancel')}
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={loading}
                >
                    {t('common.delete')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
