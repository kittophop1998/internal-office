'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Sidebar component สำหรับ navigation menu
 */
export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { t } = useTranslation();

  const menuItems = [
    { text: t('navigation.home'), icon: <HomeIcon />, href: '/' },
    { text: t('navigation.about'), icon: <InfoIcon />, href: '/about' },
    { text: t('navigation.contact'), icon: <ContactMailIcon />, href: '/contact' },
  ];

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250 }} role="presentation" onClick={onClose}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} href={item.href}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};
