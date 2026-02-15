'use client';

import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardActions,
  CardProps as MuiCardProps,
  Divider,
} from '@mui/material';

export interface CardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Card component สำหรับแสดงเนื้อหาในกล่อง
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  children,
  ...props
}) => {
  return (
    <MuiCard {...props}>
      {(title || subtitle) && (
        <>
          <CardHeader title={title} subheader={subtitle} />
          <Divider />
        </>
      )}
      <CardContent>{children}</CardContent>
      {actions && (
        <>
          <Divider />
          <CardActions>{actions}</CardActions>
        </>
      )}
    </MuiCard>
  );
};
