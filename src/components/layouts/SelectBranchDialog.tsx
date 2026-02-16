'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    IconButton,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { Branch } from '@/services/api/master.service';

interface SelectBranchDialogProps {
    open: boolean;
    onClose: () => void;
    branches: Branch[];
    currentBranchId: string | null;
    onBranchChange: (branchId: string | null) => void;
}

export default function SelectBranchDialog({
    open,
    onClose,
    branches,
    currentBranchId,
    onBranchChange
}: SelectBranchDialogProps) {
    const handleBranchSelect = (branchId: number) => {
        const branchIdStr = String(branchId);
        onBranchChange(branchIdStr);
        localStorage.setItem("currentBranchId", branchIdStr);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                pb: 1
            }}>
                <Typography variant="h6" component="div">
                    เลือกสาขา
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: 'text.secondary'
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                {branches.length === 0 ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        minHeight: 200,
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <CircularProgress size={40} />
                        <Typography variant="body2" color="text.secondary">
                            กำลังโหลดข้อมูลสาขา...
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ py: 0 }}>
                        {branches.map((branch) => {
                            const isSelected = String(branch.id) === currentBranchId;
                            
                            return (
                                <ListItem
                                    key={branch.id}
                                    disablePadding
                                    secondaryAction={
                                        isSelected ? (
                                            <CheckIcon color="primary" />
                                        ) : null
                                    }
                                >
                                    <ListItemButton
                                        onClick={() => handleBranchSelect(branch.id)}
                                        selected={isSelected}
                                        sx={{
                                            py: 2,
                                            '&.Mui-selected': {
                                                backgroundColor: 'action.selected',
                                                '&:hover': {
                                                    backgroundColor: 'action.selected',
                                                }
                                            }
                                        }}
                                    >
                                        <ListItemText
                                            primary={branch.name}
                                            secondary={branch.location}
                                            primaryTypographyProps={{
                                                fontWeight: isSelected ? 600 : 400
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
}
