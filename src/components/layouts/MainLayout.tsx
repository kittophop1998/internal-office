'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';

export interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
  copyrightText?: string;
}

/**
 * Main Layout component พร้อม Header, Sidebar และ Footer
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  showSidebar = false,
  copyrightText,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Header
        title={title}
        onMenuClick={showSidebar ? handleSidebarToggle : undefined}
      />
      {showSidebar && (
        <Sidebar open={sidebarOpen} onClose={handleSidebarToggle} />
      )}
      <Box component="main" flex={1} py={3}>
        {children}
      </Box>
      <Footer copyrightText={copyrightText} />
    </Box>
  );
};
