'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export interface LoadingProps {
  message?: string;
  size?: number;
}

/**
 * Loading component สำหรับแสดงสถานะการโหลด
 */
export const Loading: React.FC<LoadingProps> = ({ message, size = 40 }) => {

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      py={4}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};
