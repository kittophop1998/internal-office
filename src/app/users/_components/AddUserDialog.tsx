"use client";

import { useState } from "react";
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
    IconButton,
    InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useCreateUser } from "@/hooks/api/useUser";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/hooks/useNotification";
import { useDepartments, useBranches, useRoles } from "@/hooks/api/useMaster";

interface AddUserDialogProps {
    open: boolean;
    onClose: () => void;
}

const initialFormData = {
    fullName: "",
    username: "",
    password: "",
    email: "",
    departmentId: null as number | null,
    roleId: null as number | null,
    branchIds: [] as number[],
};

export default function AddUserDialog({ open, onClose }: AddUserDialogProps) {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const createUserMutation = useCreateUser();

    const { data: departments = [] } = useDepartments();
    const { data: roles = [] } = useRoles();
    const { data: branches = [] } = useBranches();

    const [formData, setFormData] = useState(initialFormData);
    const [showPassword, setShowPassword] = useState(false);

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
        try {
            await createUserMutation.mutateAsync({
                fullName: formData.fullName,
                username: formData.username,
                password: formData.password,
                email: formData.email,
                departmentId: formData.departmentId,
                roleId: formData.roleId,
                branchIds: formData.branchIds,
            });

            showNotification(t("users.createSuccess"), "success");
            setFormData(initialFormData);
            onClose();
        } catch (error) {
            showNotification(
                t("users.createError", {
                    message: error instanceof Error ? error.message : "Unknown error",
                }),
                "error"
            );
        }
    };

    const handleClose = () => {
        if (!createUserMutation.isPending) {
            setFormData(initialFormData);
            onClose();
        }
    };

    console.log("sdssd", roles)

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ fontWeight: 600 }}>{t("users.addUser")}</DialogTitle>
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <TextField
                        label={t("users.fullname")}
                        value={formData.fullName}
                        onChange={handleChange("fullName")}
                        fullWidth
                        required
                    />

                    <TextField
                        label={t("users.username")}
                        value={formData.username}
                        onChange={handleChange("username")}
                        fullWidth
                        required
                    />

                    <TextField
                        label={t("users.password")}
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange("password")}
                        fullWidth
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
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
                <Button onClick={handleClose} disabled={createUserMutation.isPending}>
                    {t("common.cancel")}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={createUserMutation.isPending}
                    startIcon={createUserMutation.isPending ? <CircularProgress size={16} /> : null}
                >
                    {createUserMutation.isPending ? t("common.saving") : t("common.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
