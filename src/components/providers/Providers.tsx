'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/lib/theme';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </ReactQueryProvider>
  );
}
