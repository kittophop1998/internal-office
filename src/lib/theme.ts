import { PaletteMode } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

// Color Palette
// Primary:   Navy Blue   – trust, formal, professional
// Secondary: Dark Gray   – elegant, modern
// Accent:    Olive Green – fresh, energetic  (mapped to info slot for easy access)
// Neutral:   White, Light Gray, Black

export const getTheme = (mode: PaletteMode) => createTheme({
    palette: {
        mode,
        primary: {
            light: '#2a4a7f',
            main: '#1a2e5a',   // Navy Blue
            dark: '#0f1c3a',
            contrastText: '#ffffff',
        },
        secondary: {
            light: '#6b6b6b',
            main: '#3d3d3d',   // Dark Gray
            dark: '#1a1a1a',
            contrastText: '#ffffff',
        },
        info: {
            light: '#8a9a4a',
            main: '#6b7a2e',   // Olive Green (Accent)
            dark: '#4a5520',
            contrastText: '#ffffff',
        },
        error: {
            main: '#c0392b',
            contrastText: '#ffffff',
        },
        warning: {
            main: '#d35400',
            contrastText: '#ffffff',
        },
        success: {
            main: '#27ae60',
            contrastText: '#ffffff',
        },
        background: {
            default: mode === 'dark' ? '#121212' : '#f5f5f5',
            paper:   mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
        text: {
            primary:   mode === 'dark' ? '#f0f0f0' : '#1a1a1a',
            secondary: mode === 'dark' ? '#b0b0b0' : '#5a5a5a',
        },
        divider: mode === 'dark' ? '#3d3d3d' : '#e0e0e0',
    },
    shape: {
        borderRadius: 8,
    },
    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    transition: 'all 0.25s ease',
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #2a4a7f 0%, #1a2e5a 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #1a2e5a 0%, #0f1c3a 100%)',
                        boxShadow: '0 6px 20px rgba(26,46,90,0.45)',
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2a4a7f',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1a2e5a',
                        borderWidth: 2,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                },
            },
        },
    },
});

export const theme = getTheme('light');