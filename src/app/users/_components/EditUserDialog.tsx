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
    CircularProgress,
    OutlinedInput,
    InputLabel,
    FormControl,
    Select,
    Checkbox,
    ListItemText,
} from "@mui/material";
import { User } from "@/services/api/user.service";
import { useUpdateUser } from "@/hooks/api/useUser";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/hooks/useNotification";
import { useDepartments, useMasterBranches, useRoles } from "@/hooks/api/useMaster";

interface EditUserDialogProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
}

export default function EditUserDialog({ open, user, onClose }: EditUserDialogProps) {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const updateUserMutation = useUpdateUser();

    const { data: departments = [] } = useDepartments();
    const { data: roles = [] } = useRoles();
    const { data: branches = [] } = useMasterBranches();

    const getInitialFormData = () => ({
        fullName: user?.fullName || "",
        email: user?.email || "",
        departmentId: user?.departmentId ?? null,
        roleId: user?.roleId ?? null,
        branchIds: user?.branches?.map((b) => b.branchId) ?? [],
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
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSelectChange = (field: "departmentId" | "roleId") => (value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value ? Number(value) : null }));
    };

    const handleBranchChange = (value: number[]) => {
        setFormData((prev) => ({ ...prev, branchIds: value }));
    };

    const handleSubmit = async () => {
        if (!user) return;

        try {
            await updateUserMutation.mutateAsync({
                userId: user.id,
                data: {
                    fullName: formData.fullName,
                    email: formData.email,
                    departmentId: formData.departmentId,
                    roleId: formData.roleId,
                    branchIds: formData.branchIds,
                },
            });

            showNotification(t("users.updateSuccess"), "success");
            onClose();
        } catch (error) {
            showNotification(
                t("users.updateError", {
                    message: error instanceof Error ? error.message : "Unknown error",
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
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ fontWeight: 600 }}>{t("users.editUser")}</DialogTitle>
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <TextField
                        label={t("users.username")}
                        value={user?.username || ""}
                        disabled
                        fullWidth
                        helperText={t("users.usernameReadonly")}
                    />

                    <TextField
                        label={t("users.fullname")}
                        value={formData.fullName}
                        onChange={handleChange("fullName")}
                        fullWidth
                        required
                    />

                    <TextField
                        label={t("users.email")}
                        type="email"
                        value={formData.email}
                        onChange={handleChange("email")}
                        fullWidth
                        required
                    />

                    {/* Department */}
                    <TextField
                        select
                        label={t("users.department")}
                        value={formData.departmentId ?? ""}
                        onChange={(e) => handleSelectChange("departmentId")(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="">
                            <em>{t("users.noDepartment")}</em>
                        </MenuItem>
                        {departments.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id}>
                                {dept.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Role / Position */}
                    <TextField
                        select
                        label={t("users.role")}
                        value={formData.roleId ?? ""}
                        onChange={(e) => handleSelectChange("roleId")(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="">
                            <em>{t("users.noRole")}</em>
                        </MenuItem>
                        {roles.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                                {role.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Branches multi-select */}
                    <FormControl fullWidth>
                        <InputLabel>{t("users.branches")}</InputLabel>
                        <Select
                            multiple
                            value={formData.branchIds}
                            onChange={(e) => handleBranchChange(e.target.value as number[])}
                            input={<OutlinedInput label={t("users.branches")} />}
                            renderValue={(selected) =>
                                branches
                                    .filter((b) => (selected as number[]).includes(b.id))
                                    .map((b) => b.name)
                                    .join(", ")
                            }
                        >
                            {branches.map((branch) => (
                                <MenuItem key={branch.id} value={branch.id}>
                                    <Checkbox checked={formData.branchIds.includes(branch.id)} />
                                    <ListItemText primary={branch.name} secondary={branch.location} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={updateUserMutation.isPending}>
                    {t("common.cancel")}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={updateUserMutation.isPending}
                    startIcon={updateUserMutation.isPending ? <CircularProgress size={16} /> : null}
                >
                    {updateUserMutation.isPending ? t("common.saving") : t("common.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
