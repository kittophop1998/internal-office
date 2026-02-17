"use client";

import { MainLayout } from "@/components/layouts";
import { useTranslation } from "react-i18next";

export default function UsersPage() {
    const { t } = useTranslation();
    
    return (
        <MainLayout title={t('users.title')} backUrl="/dashboard" showBackButton>
            <h1>{t('users.pageTitle')}</h1>
        </MainLayout>
    );
}