"use client";

import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layouts";
import TaskForm from "./_components/TaskForm";

export default function TaskDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const isCreateMode = id === "new";

    return (
        <MainLayout
            title={isCreateMode ? "เพิ่มรายการใหม่" : "แก้ไขรายการ"}
            backUrl="/tasks"
            showBackButton
        >
            <TaskForm
                mode={isCreateMode ? "create" : "edit"}
                taskId={isCreateMode ? undefined : Number(id)}
            />
        </MainLayout>
    );
}
