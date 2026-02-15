'use client';

import React from 'react';
import { Alert, AlertTitle, Snackbar } from '@mui/material';

export interface NotificationProps {
  open: boolean;
  message: string;
  title?: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  autoHideDuration?: number;
}

/**
 * Notification component สำหรับแสดงข้อความแจ้งเตือน
 */
export const Notification: React.FC<NotificationProps> = ({
  open,
  message,
  title,
  severity = 'info',
  onClose,
  autoHideDuration = 6000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};
