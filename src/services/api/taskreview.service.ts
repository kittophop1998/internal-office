import { BaseApiService } from "./base.service";
import { TaskSessionItem } from "./tasksession.service";

export interface UpdateTaskReviewPayload {
    sessionId: number;
    status: string;
    managerComment?: string;
}

export class TaskReview extends BaseApiService {
    private static readonly BASE_PATH = '/task-reviews';

    static async updateTaskReviews(payload: UpdateTaskReviewPayload[]) {
        return this.put<TaskSessionItem[]>(`${this.BASE_PATH}`, payload);
    }

    static async getTaskReviews(params?: { branchId?: number; type?: string }) {
        return this.get<TaskSessionItem[]>(`${this.BASE_PATH}`, { params });
    }
}