'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    IconButton,
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Skeleton,
    Divider,
    Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StoreIcon from '@mui/icons-material/Store';
import { BranchItem } from '@/services/api/master.service';
import { UserService } from '@/services/api/user.service';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface SelectBranchDialogProps {
    open: boolean;
    onClose: () => void;
    branches: BranchItem[];
    isLoading?: boolean;
    currentBranchId: string | null;
    onBranchChange: (branchId: string | null) => void;
}

const FAVORITES_KEY = 'favoriteBranchIds';

function loadFavorites(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
        const raw = localStorage.getItem(FAVORITES_KEY);
        return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
        return new Set();
    }
}

function saveFavorites(favs: Set<string>) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
}

function BranchDialogContent({
    onClose,
    branches,
    isLoading = false,
    currentBranchId,
    onBranchChange
}: Omit<SelectBranchDialogProps, 'open'>) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [pendingBranchId, setPendingBranchId] = useState<string | null>(currentBranchId);
    const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites());

    const toggleFavorite = (e: React.MouseEvent, branchId: string) => {
        e.stopPropagation();
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(branchId)) {
                next.delete(branchId);
            } else {
                next.add(branchId);
            }
            saveFavorites(next);
            return next;
        });
    };

    const filteredBranches = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = q
            ? branches.filter(b =>
                b.name.toLowerCase().includes(q) ||
                (b.location && b.location.toLowerCase().includes(q))
            )
            : branches;

        // Sort: current first, then favorites, then alphabetical
        return [...list].sort((a, b) => {
            const aId = String(a.id);
            const bId = String(b.id);
            if (aId === currentBranchId) return -1;
            if (bId === currentBranchId) return 1;
            const aFav = favorites.has(aId);
            const bFav = favorites.has(bId);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return a.name.localeCompare(b.name, 'th');
        });
    }, [branches, search, currentBranchId, favorites]);

    const handleConfirm = async () => {
        if (!pendingBranchId) return;
        onBranchChange(pendingBranchId);
        localStorage.setItem('currentBranchId', pendingBranchId);
        try {
            await UserService.updateCurrentBranch({ currentBranchId: Number(pendingBranchId) });
        } catch (error) {
            console.error('Failed to update current branch:', error);
        }
        onClose();
    };

    const skeletonItems = Array.from({ length: 6 });
    const currentBranchObj = branches.find(b => String(b.id) === currentBranchId);

    return (
        <>
            {/* Header */}
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                    py: 2,
                    px: 3,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <StoreIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {t('branchDialog.title')}
                    </Typography>
                </Box>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* Search Bar */}
            <Box sx={{ px: 3, pt: 2, pb: 1, backgroundColor: 'background.paper' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder={t('branchDialog.searchPlaceholder')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoComplete="off"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'action.hover',
                            '& fieldset': { border: 'none' },
                            '&:hover fieldset': { border: 'none' },
                            '&.Mui-focused fieldset': { border: '1.5px solid', borderColor: 'primary.main' },
                        }
                    }}
                />

                {/* Currently selected info */}
                {currentBranchObj && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            {t('branchDialog.currentLabel')}:
                        </Typography>
                        <Chip
                            label={currentBranchObj.name}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                    </Box>
                )}
            </Box>

            {/* Branch List */}
            <DialogContent sx={{ p: 0, overflowY: 'auto', flex: 1 }}>
                {isLoading ? (
                    <List sx={{ py: 0 }}>
                        {skeletonItems.map((_, i) => (
                            <ListItem key={i} sx={{ px: 3, py: 1 }}>
                                <Box sx={{ width: '100%' }}>
                                    <Skeleton variant="text" width="60%" height={22} />
                                    <Skeleton variant="text" width="40%" height={16} />
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                ) : filteredBranches.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 180,
                        flexDirection: 'column',
                        gap: 1,
                        px: 3
                    }}>
                        <SearchIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            {search ? t('branchDialog.noSearchResults', { query: search }) : t('branchDialog.noBranches')}
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ py: 0.5 }} disablePadding>
                        {filteredBranches.map((branch, index) => {
                            const branchId = String(branch.id);
                            const isCurrent = branchId === currentBranchId;
                            const isPending = branchId === pendingBranchId;
                            const isFav = favorites.has(branchId);

                            const showFavDivider =
                                index > 0 &&
                                !isCurrent &&
                                !favorites.has(String(filteredBranches[index - 1].id)) &&
                                !search;

                            const showFavHeader =
                                index === 0 && isCurrent && filteredBranches.length > 1 && !search;

                            return (
                                <Box key={branch.id}>
                                    {showFavHeader && (
                                        <Box sx={{ px: 3, pt: 1, pb: 0.5 }}>
                                            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
                                                {t('branchDialog.currentSection')}
                                            </Typography>
                                        </Box>
                                    )}
                                    {showFavDivider && (
                                        <Divider sx={{ my: 0.5, mx: 3 }} />
                                    )}
                                    <ListItem
                                        disablePadding
                                        secondaryAction={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pr: 1 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={e => toggleFavorite(e, branchId)}
                                                    aria-label={isFav ? t('branchDialog.removeFavorite') : t('branchDialog.addFavorite')}
                                                    sx={{ color: isFav ? 'warning.main' : 'text.disabled', p: 0.5 }}
                                                >
                                                    {isFav ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                                </IconButton>
                                                {isPending && (
                                                    <CheckIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                                )}
                                            </Box>
                                        }
                                    >
                                        <ListItemButton
                                            onClick={() => setPendingBranchId(branchId)}
                                            selected={isPending}
                                            sx={{
                                                py: 1.5,
                                                pl: 3,
                                                pr: 10,
                                                borderRadius: 1,
                                                mx: 1,
                                                my: 0.25,
                                                transition: 'background-color 0.15s',
                                                ...(isCurrent && {
                                                    backgroundColor: 'primary.50',
                                                    border: '1px solid',
                                                    borderColor: 'primary.200',
                                                }),
                                                '&.Mui-selected': {
                                                    backgroundColor: 'primary.main',
                                                    color: 'primary.contrastText',
                                                    '& .MuiListItemText-primary': { color: 'primary.contrastText' },
                                                    '& .MuiListItemText-secondary': { color: 'primary.100' },
                                                    '&:hover': {
                                                        backgroundColor: 'primary.dark',
                                                    }
                                                },
                                                '&:hover': {
                                                    backgroundColor: isPending ? 'primary.dark' : 'action.hover',
                                                }
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: isCurrent || isPending ? 700 : 400,
                                                                color: 'inherit',
                                                                lineHeight: 1.4
                                                            }}
                                                        >
                                                            {branch.name}
                                                        </Typography>
                                                        {isCurrent && (
                                                            <Chip
                                                                label={t('branchDialog.currentBadge')}
                                                                size="small"
                                                                color={isPending ? 'default' : 'primary'}
                                                                sx={{
                                                                    height: 18,
                                                                    fontSize: '0.6rem',
                                                                    fontWeight: 700,
                                                                    ...(isPending && { backgroundColor: 'rgba(255,255,255,0.25)', color: 'inherit' })
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    branch.location ? (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{ color: 'inherit', opacity: 0.7 }}
                                                        >
                                                            {branch.location}
                                                        </Typography>
                                                    ) : undefined
                                                }
                                                disableTypography
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </Box>
                            );
                        })}
                    </List>
                )}
            </DialogContent>

            {/* Footer — Confirm Button */}
            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    gap: 1,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{ borderRadius: 2, textTransform: 'none', minWidth: 80 }}
                >
                    {t('common.cancel')}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!pendingBranchId || isLoading}
                    sx={{ borderRadius: 2, textTransform: 'none', minWidth: 100, fontWeight: 700 }}
                >
                    {t('branchDialog.confirm')}
                </Button>
            </DialogActions>
        </>
    );
}

export default function SelectBranchDialog(props: SelectBranchDialogProps) {
    const { open, ...rest } = props;
    return (
        <Dialog
            open={open}
            onClose={rest.onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh',
                },
            }}
        >
            {/* key resets inner state each time dialog opens */}
            <BranchDialogContent key={open ? 'open' : 'closed'} {...rest} />
        </Dialog>
    );
}
