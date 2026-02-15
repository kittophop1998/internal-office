'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';

export interface ModalProps {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hideActions?: boolean;
  loading?: boolean;
}

/**
 * Modal component สำหรับแสดง dialog
 * ใช้งานง่าย รองรับ i18n
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmText,
  cancelText,
  maxWidth = 'sm',
  hideActions = false,
  loading = false,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      {title && (
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {title}
            <IconButton onClick={onClose} size="small" edge="end">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
      )}
      <DialogContent>{children}</DialogContent>
      {!hideActions && (
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            {cancelText || t('common.cancel')}
          </Button>
          {onConfirm && (
            <Button onClick={onConfirm} variant="contained" loading={loading}>
              {confirmText || t('common.confirm')}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};
