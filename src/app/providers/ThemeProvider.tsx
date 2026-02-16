'use client';

import { createContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme } from '@/lib/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeModeContextValue {
    mode: ThemeMode;
    toggleTheme: () => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue>({
    mode: 'light',
    toggleTheme: () => {},
});

interface AppThemeProviderProps {
    children: ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
    // Initialize mode from localStorage
    const [mode, setMode] = useState<ThemeMode>(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('themeMode') as ThemeMode;
            return savedMode === 'dark' ? 'dark' : 'light';
        }
        return 'light';
    });

    const toggleTheme = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            if (typeof window !== 'undefined') {
                localStorage.setItem('themeMode', newMode);
            }
            return newMode;
        });
    };

    const theme = useMemo(() => createAppTheme(mode), [mode]);

    const contextValue = useMemo(
        () => ({
            mode,
            toggleTheme,
        }),
        [mode]
    );

    return (
        <ThemeModeContext.Provider value={contextValue}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
}
