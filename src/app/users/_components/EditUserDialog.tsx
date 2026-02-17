"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    MenuItem,
    FormControlLabel,
    Switch,
    CircularProgress,
} from "@mui/material";
import { User, Position } from "@/services/api/user.service";
import { useUpdateUser } from "@/hooks/api/useUser";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/hooks/useNotification";

interface EditUserDialogProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
}

export default function EditUserDialog({ open, user, onClose }: EditUserDialogProps) {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const updateUserMutation = useUpdateUser();

    const getInitialFormData = () => ({
        fullname: user?.fullname || "",
        email: user?.email || "",
        telephone: user?.telephone || "",
        address: user?.address || "",
        roleName: user?.roleName || null,
        isActive: user?.isActive ?? true,
    });

    const [formData, setFormData] = useState(getInitialFormData);

    useEffect(() => {
        if (open && user) {
            setFormData(getInitialFormData());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, user?.id]);

    const handleChange = (field: keyof typeof formData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = field === "isActive" ? event.target.checked : event.target.value;
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!user) return;

        try {
            const updateData = {
                ...formData,
                roleName: formData.roleName || null,
            };

            await updateUserMutation.mutateAsync({
                userId: user.id,
                data: updateData,
            });

            showNotification(t('users.updateSuccess'), "success");
            onClose();
        } catch (error) {
            showNotification(
                t('users.updateError', { 
                    message: error instanceof Error ? error.message : 'Unknown error' 
                }),
                "error"
            );
        }
    };

    const handleClose = () => {
        if (!updateUserMutation.isPending) {
            onClose();
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 600 }}>
                {t('users.editUser')}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <TextField
                        label={t('users.username')}
                        value={user?.username || ""}
                        disabled
                        fullWidth
                        helperText={t('users.usernameReadonly')}
                    />
                    
                    <TextField
                        label={t('users.fullname')}
                        value={formData.fullname}
                        onChange={handleChange("fullname")}
                        fullWidth
                        required
                    />

                    <TextField
                        label={t('users.email')}
                        type="email"
                        value={formData.email}
                        onChange={handleChange("email")}
                        fullWidth
                        required
                    />

                    <TextField
                        label={t('users.telephone')}
                        value={formData.telephone}
                        onChange={handleChange("telephone")}
                        fullWidth
                    />

                    <TextField
                        label={t('users.address')}
                        value={formData.address}
                        onChange={handleChange("address")}
                        fullWidth
                        multiline
                        rows={3}
                    />

                    <TextField
                        select
                        label={t('users.role')}
                        value={formData.roleName || ""}
                        onChange={handleChange("roleName")}
                        fullWidth
                    >
                        <MenuItem value="">
                            <em>{t('users.noRole')}</em>
                        </MenuItem>
                        <MenuItem value="admin">{t('users.roleAdmin')}</MenuItem>
                        <MenuItem value="manager">{t('users.roleManager')}</MenuItem>
                        <MenuItem value="staff">{t('users.roleStaff')}</MenuItem>
                    </TextField>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.isActive}
                                onChange={handleChange("isActive")}
                            />
                        }
                        label={t('users.activeStatus')}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                    onClick={handleClose} 
                    disabled={updateUserMutation.isPending}
                >
                    {t('common.cancel')}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={updateUserMutation.isPending}
                    startIcon={updateUserMutation.isPending ? <CircularProgress size={16} /> : null}
                >
                    {updateUserMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
