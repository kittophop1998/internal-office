'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  AlertTitle,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircleOutline,
  AssignmentTurnedIn,
  FactCheck,
  Groups,
} from '@mui/icons-material';
import { Button, TextField, Notification } from '@/components/common';
import { useAuth } from '@/hooks/api/useAuth';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

// Brand colors
const NAVY      = '#1a2e5a';
const NAVY_LIGHT = '#2a4a7f';
const NAVY_DARK  = '#0f1c3a';
const OLIVE      = '#6b7a2e';
const OLIVE_LIGHT = '#8a9a4a';
const DARK_GRAY  = '#3d3d3d';

interface LoginFormData {
  username: string;
  password: string;
}

// Feature item shown on the branding panel
function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#fff',
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
        {text}
      </Typography>
    </Box>
  );
}

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const muiTheme = useMuiTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('md'));

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('user');
    }
    return false;
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
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
            title: t('common.success'),
          });
          
          const role = res.user?.roleCode?.toUpperCase();
          const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';

          setTimeout(() => {
            router.push(isAdminOrManager ? '/dashboard' : '/checklists');
          }, 1500);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.unknownError'));
    }
  };

  if (isRedirecting) return null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        backgroundColor: '#f0f2f5',
      }}
    >
      {/* ───── Left Panel – Branding (desktop only on left, mobile at bottom) ───── */}
      <Box
        sx={{
          order: { xs: 2, md: 1 },
          flex: { xs: '0 0 auto', md: '0 0 45%' },
          background: `linear-gradient(160deg, ${NAVY_LIGHT} 0%, ${NAVY} 50%, ${NAVY_DARK} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: { xs: 'center', md: 'flex-start' },
          px: { xs: 4, md: 7 },
          py: { xs: 5, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute', top: -80, right: -80,
          width: 280, height: 280, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -60, left: -60,
          width: 220, height: 220, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.04)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: 120, right: 20,
          width: 120, height: 120, borderRadius: '50%',
          backgroundColor: 'rgba(107,122,46,0.25)',
        }} />

        {/* Logo / Brand mark */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5, zIndex: 1 }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 2,
              background: `linear-gradient(135deg, ${OLIVE_LIGHT}, ${OLIVE})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            }}
          >
            <FactCheck sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.1 }}>
              Internal
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 500, fontSize: '0.78rem', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Checklist System
            </Typography>
          </Box>
        </Box>

        {/* Headline */}
        <Box sx={{ zIndex: 1, maxWidth: 380, mb: 5, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography
            variant="h4"
            sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.3, mb: 1.5 }}
          >
            Streamline Your<br />Daily Operations
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.70)', lineHeight: 1.8 }}>
            จัดการ checklist รายวัน รายสัปดาห์ และรายเดือน<br />
            พร้อมระบบรายงานที่ครบครัน
          </Typography>
        </Box>

        {/* Feature list */}
        <Box sx={{ zIndex: 1, textAlign: 'left' }}>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mb: 3 }} />
          <FeatureItem icon={<CheckCircleOutline fontSize="small" />} text="ตรวจสอบ checklist แบบ real-time" />
          <FeatureItem icon={<AssignmentTurnedIn fontSize="small" />} text="ติดตามงานและรายงานผลได้ทันที" />
          <FeatureItem icon={<Groups fontSize="small" />} text="รองรับทีมงานหลายคนพร้อมกัน" />
        </Box>

        {/* Bottom tag */}
        {isDesktop && (
          <Typography
            variant="caption"
            sx={{ position: 'absolute', bottom: 28, left: 56, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}
          >
            © {new Date().getFullYear()} Internal Operations · All rights reserved
          </Typography>
        )}
      </Box>

      {/* ───── Right Panel – Login Form ───── */}
      <Box
        sx={{
          order: { xs: 1, md: 2 },
          flex: { xs: '1 1 auto', md: '1 1 55%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 6, md: 8 },
          py: { xs: 6, md: 4 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>

          {/* Form Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 700, color: NAVY, mb: 0.75 }}
            >
              {t('login.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: DARK_GRAY }}>
              {t('login.subtitle')}
            </Typography>
          </Box>

          {/* Accent line */}
          <Box
            sx={{
              width: 48, height: 4, borderRadius: 2,
              background: `linear-gradient(90deg, ${OLIVE}, ${OLIVE_LIGHT})`,
              mb: 4,
            }}
          />

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                <AlertTitle>{t('login.loginError')}</AlertTitle>
                {error}
              </Alert>
            )}

            {/* Username */}
            <Typography variant="caption" sx={{ fontWeight: 600, color: DARK_GRAY, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 0.75 }}>
              {t('login.username')}
            </Typography>
            <TextField
              name="username"
              control={control}
              fullWidth
              placeholder={t('login.username')}
              variant="outlined"
              rules={{
                required: t('validation.usernameRequired'),
                minLength: { value: 3, message: t('validation.usernameMinLength') },
              }}
              error={!!errors.username}
              helperText={errors.username?.message}
              disabled={loginMutation.isPending}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#dde1e7' },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: NAVY_LIGHT, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Password */}
            <Typography variant="caption" sx={{ fontWeight: 600, color: DARK_GRAY, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 0.75 }}>
              {t('login.password')}
            </Typography>
            <TextField
              name="password"
              control={control}
              fullWidth
              placeholder={t('login.password')}
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              rules={{
                required: t('validation.passwordRequired'),
                minLength: { value: 6, message: t('validation.passwordMinLength') },
              }}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loginMutation.isPending}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#dde1e7' },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: NAVY_LIGHT, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        aria-label="toggle password visibility"
                        sx={{
                          color: DARK_GRAY,
                          '&:hover': { color: NAVY, backgroundColor: 'rgba(26,46,90,0.06)' },
                        }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              loading={loginMutation.isPending}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${NAVY_LIGHT} 0%, ${NAVY} 100%)`,
                boxShadow: `0 4px 16px rgba(26,46,90,0.35)`,
                letterSpacing: 0.5,
                '&:hover': {
                  background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
                  boxShadow: `0 6px 22px rgba(26,46,90,0.50)`,
                  transform: 'translateY(-2px)',
                },
                '&:active': { transform: 'translateY(0)' },
                transition: 'all 0.25s ease',
              }}
            >
              {t('login.loginButton')}
            </Button>
          </Box>

          {/* Footer note */}
          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', mt: 4, color: '#aaa' }}
          >
            © {new Date().getFullYear()} Internal Operations
          </Typography>
        </Box>
      </Box>

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