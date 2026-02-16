import { BaseApiService } from "./base.service";

export interface TaskItem {
    id: number;
    title: string;
    type: string;
    subtype?: string | null;
    description?: string | null;
    sort_order: number;
    weight?: number | null;
    users: Array<{ id: number; name: string }>;
    created_at: string;
}

export interface CreateTaskPayload {
    title: string;
    type: string;
    subtype?: string | null;
    description?: string | null;
    sortOrder: number;
    weight?: number | null;
    users: Array<number | string>;
    position?: string | null;
}


export class TaskService extends BaseApiService {
    private static readonly BASE_PATH = '/tasks';

    static async fetchAll() {
        return this.get<TaskItem[]>(this.BASE_PATH);
    }

    static async fetchById(taskId: number) {
        return this.get<TaskItem>(`${this.BASE_PATH}/${taskId}`);
    }

    static async create(payload: CreateTaskPayload) {
        console.log('Creating task with payload:', payload);
        return this.post<TaskItem, CreateTaskPayload>(this.BASE_PATH, payload);
    }

    static async deleteTask(taskId: number):Promise<void> {
        return this.delete<void>(`${this.BASE_PATH}/${taskId}`);
    }

    static async updateTask(taskId: number, payload: Partial<CreateTaskPayload>) {
        return this.put<TaskItem, Partial<CreateTaskPayload>>(`${this.BASE_PATH}/${taskId}`, payload);
    }
}