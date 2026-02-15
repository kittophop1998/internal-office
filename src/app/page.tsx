'use client';

import { Container, Typography, Box, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layouts';
import { Button, Card } from '@/components/common';
import Link from 'next/link';

export default function Home() {
  const { t } = useTranslation();

  return (
    <MainLayout title="Next.js Boilerplate" showSidebar>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {t('navigation.home')}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Next.js Boilerplate with MUI and i18n
          </Typography>

          <Stack spacing={3} mt={4}>
            <Card
              title="🎨 Material-UI (MUI)"
              subtitle="Component Library พร้อมใช้งาน"
            >
              <Typography variant="body2" paragraph>
                ใช้ MUI เป็น UI Library หลัก พร้อม Theme customization
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Buttons, Cards, Modals, TextFields
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Layouts: Header, Footer, Sidebar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Loading และ Notification components
              </Typography>
            </Card>

            <Card
              title="🌍 Internationalization (i18n)"
              subtitle="รองรับหลายภาษา"
            >
              <Typography variant="body2" paragraph>
                ใช้ i18next และ react-i18next สำหรับการจัดการภาษา
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • รองรับภาษาไทยและอังกฤษ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • สลับภาษาได้ง่ายผ่าน Header menu
              </Typography>
            </Card>

            <Card
              title="📦 Common Components"
              subtitle="Components พื้นฐานที่ใช้บ่อย"
            >
              <Typography variant="body2" paragraph>
                Components ที่ออกแบบให้ใช้งานง่าย อ่านโค้ดง่าย
              </Typography>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  href="/example"
                >
                  ดูตัวอย่าง Components
                </Button>
              </Box>
            </Card>
          </Stack>
        </Box>
      </Container>
    </MainLayout>
  );
}
