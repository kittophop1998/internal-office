'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  CardContent,
  Container,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { Card, Button, TextField, Notification } from '@/components/common';
import { useAuth } from '@/hooks/api/useAuth';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface LoginFormData {
  username: string;
  password: string;
}

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: ''
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        const role = parsed?.roleCode?.toUpperCase();
        const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';
        router.replace(isAdminOrManager ? '/dashboard' : '/checklists');
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, [router]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const loginMutation = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await loginMutation.mutateAsync(data, {
        onSuccess: (res) => {
          setNotification({
            open: true,
            message: t('login.loginSuccess'),
            severity: 'success',
            title: t('common.success')
          });
          const role = res.user?.roleCode?.toUpperCase();
          const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';
          setTimeout(() => {
            router.push(isAdminOrManager ? '/dashboard' : '/checklists');
          }, 1500);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.unknownError'));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: 'primary.main',
                }}
              >
                {t('login.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {t('login.subtitle')}
              </Typography>
            </Box>

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <AlertTitle>{t('login.loginError')}</AlertTitle>
                  {error}
                </Alert>
              )}

              <TextField
                name="username"
                control={control}
                fullWidth
                label={t('login.username')}
                variant="outlined"
                rules={{
                  required: t('validation.usernameRequired'),
                  minLength: {
                    value: 3,
                    message: t('validation.usernameMinLength')
                  }
                }}
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={loginMutation.isPending}
                sx={{ mb: 3 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    )
                  }
                }}
              />

              <TextField
                name="password"
                control={control}
                fullWidth
                label={t('login.password')}
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                rules={{
                  required: t('validation.passwordRequired'),
                  minLength: {
                    value: 6,
                    message: t('validation.passwordMinLength')
                  }
                }}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={loginMutation.isPending}
                sx={{ mb: 4 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                loading={loginMutation.isPending}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                {t('login.loginButton')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Notification */}
      <Notification
        open={notification.open}
        message={notification.message}
        title={notification.title}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
}