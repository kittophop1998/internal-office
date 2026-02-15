'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';

export interface ErrorBoundaryProps {
  message?: string;
}

/**
 * ErrorBoundary component สำหรับแสดงหน้าข้อผิดพลาด
 */
export const ErrorMessage: React.FC<ErrorBoundaryProps> = ({ message }) => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={2}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 64 }} />
        <Typography variant="h5" color="error">
          {t('common.error')}
        </Typography>
        {message && (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
};
