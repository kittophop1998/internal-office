import { PaletteMode } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: PaletteMode) => createTheme({
    palette: {
        mode,
        primary: {
            main: '#2563eb',
            contrastText: '#ffffff'
        },
        secondary: {
            main: '#ec4899',
            contrastText: '#ffffff'
        },
        error: {
            main: '#ef4444',
            contrastText: '#ffffff'
        },
        warning: {
            main: '#f59e0b',
            contrastText: '#ffffff'
        },
        info: {
            main: '#3b82f6',
            contrastText: '#ffffff'
        },
        success: {
            main: '#10b981',
            contrastText: '#ffffff'
        },
    },
    shape: {
        borderRadius: 8,
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
});

export const theme = getTheme('light');