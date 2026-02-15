'use client';

import { useEffect } from 'react';
import '@/lib/i18n/config';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // i18n is initialized when config is imported
  }, []);

  return <>{children}</>;
}
