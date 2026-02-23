import { Box } from "@mui/material";
import Header from "./Header";

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    backUrl?: string;
    showBackButton?: boolean;
}

export default function MainLayout({
    children,
    title = "จัดการ Form Checklist",
    backUrl = "/dashboard",
    showBackButton = true
}: MainLayoutProps) {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header
                showBackButton={showBackButton}
                backUrl={backUrl}
                title={title}
            />

            <Box component="main" sx={{ flex: 1, px: { xs: 1.5, sm: 2 }, pb: 4 }}>
                {children}
            </Box>
        </Box>
    )
}