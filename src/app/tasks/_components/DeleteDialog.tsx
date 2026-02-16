"use client";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";

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
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>ยืนยันการลบ</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary">
                    {`ต้องการลบงาน "${taskTitle}" ใช่หรือไม่?`}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    ยกเลิก
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={loading}
                >
                    ลบ
                </Button>
            </DialogActions>
        </Dialog>
    );
}
