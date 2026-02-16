import { Card } from "@/components/common";
import { MainLayout } from "@/components/layouts";

export default function ChecklistsPage() {
    return (
        <MainLayout title="Checklists" backUrl="/dashboard" showBackButton>
            <Card>
                <h2>Checklists Page</h2>
            </Card>
        </MainLayout>
    );
}