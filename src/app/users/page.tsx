import { MainLayout } from "@/components/layouts";

export default function UsersPage() {
    return (
        <MainLayout title="Users" backUrl="/dashboard" showBackButton>
            <h1>Users Page</h1>
        </MainLayout>
    );
}