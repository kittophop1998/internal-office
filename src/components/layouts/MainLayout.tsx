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
        <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Header
                showBackButton={showBackButton}
                backUrl={backUrl}
                title={title}
            />

            <Box component="main" sx={{ flex: 1, overflowY: 'auto', px: { xs: 1.5, sm: 2 }, pb: 4 }}>
                {children}
            </Box>
        </Box>
    )
}