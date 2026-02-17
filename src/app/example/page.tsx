'use client';

import { useState } from 'react';
import { Container, Typography, Box, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layouts';
import {
  Button,
  Card,
  Modal,
  Loading,
  Notification,
  TextField,
} from '@/components/common';
import { useNotification } from '@/hooks';

export default function ExamplePage() {
  const { t } = useTranslation();
  const { notification, hideNotification, showSuccess, showError, showInfo } =
    useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShowSuccess = () => {
    showSuccess(t('example.saveSuccess'), t('common.success'));
  };

  const handleShowError = () => {
    showError(t('example.saveError'), t('common.error'));
  };

  const handleShowInfo = () => {
    showInfo('นี่คือข้อความแจ้งเตือนทั่วไป');
  };

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <MainLayout title="Example Page">
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Component Examples
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            ตัวอย่างการใช้งาน Components ต่างๆ
          </Typography>

          <Stack spacing={3}>
            {/* Buttons */}
            <Card title="Buttons" subtitle="ตัวอย่างปุ่มต่างๆ">
              <Stack spacing={2}>
                <Button variant="contained" color="primary">
                  Primary Button
                </Button>
                <Button variant="outlined" color="secondary">
                  Secondary Button
                </Button>
                <Button variant="text" color="error">
                  Text Button
                </Button>
                <Button variant="contained" loading>
                  Loading Button
                </Button>
              </Stack>
            </Card>

            {/* Notifications */}
            <Card title="Notifications" subtitle="ตัวอย่างการแจ้งเตือน">
              <Stack spacing={2}>
                <Button variant="contained" color="success" onClick={handleShowSuccess}>
                  Show Success
                </Button>
                <Button variant="contained" color="error" onClick={handleShowError}>
                  Show Error
                </Button>
                <Button variant="contained" color="info" onClick={handleShowInfo}>
                  Show Info
                </Button>
              </Stack>
            </Card>

            {/* Modal */}
            <Card title="Modal" subtitle="ตัวอย่าง Modal Dialog">
              <Button variant="contained" onClick={() => setModalOpen(true)}>
                Open Modal
              </Button>
            </Card>

            {/* TextField */}
            <Card title="Text Fields" subtitle="ตัวอย่าง Input Fields">
              <Stack spacing={2}>
                <TextField name="name" label="ชื่อ" fullWidth />
                <TextField name="email" label="อีเมล" type="email" fullWidth />
                <TextField
                  name="description"
                  label="รายละเอียด"
                  multiline
                  rows={3}
                  fullWidth
                />
              </Stack>
            </Card>

            {/* Loading */}
            <Card title="Loading" subtitle="ตัวอย่างสถานะการโหลด">
              <Stack spacing={2} alignItems="center">
                <Button variant="contained" onClick={handleLoadingDemo}>
                  Show Loading
                </Button>
                {loading && <Loading message="กำลังโหลดข้อมูล..." />}
              </Stack>
            </Card>
          </Stack>
        </Box>
      </Container>

      {/* Modal Component */}
      <Modal
        open={modalOpen}
        title="ตัวอย่าง Modal"
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
          showSuccess(t('example.confirmSuccess'));
        }}
      >
        <Typography>
          นี่คือเนื้อหาภายใน Modal คุณสามารถใส่ content อะไรก็ได้ที่นี่
        </Typography>
      </Modal>

      {/* Notification Component */}
      <Notification
        open={notification.open}
        message={notification.message}
        title={notification.title}
        severity={notification.severity}
        onClose={hideNotification}
      />
    </MainLayout>
  );
}
