import { Card } from "@/components/common";
import { MainLayout } from "@/components/layouts";

export default function TaskReviewPage() {
    return (
        <MainLayout title="Task Review" backUrl="/dashboard" showBackButton>
                <Card>
                    <h2>Task Review Page</h2>
                </Card>
        </MainLayout>
    );
}