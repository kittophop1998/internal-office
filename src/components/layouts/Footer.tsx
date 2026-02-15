'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export interface FooterProps {
  copyrightText?: string;
}

/**
 * Footer component
 */
export const Footer: React.FC<FooterProps> = ({ copyrightText }) => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {copyrightText || `© ${year} All rights reserved.`}
        </Typography>
      </Container>
    </Box>
  );
};
