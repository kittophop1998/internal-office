import { BaseApiService } from "./base.service";

export interface TaskSessionFilter {
    type?: string;
    subType?: string;
    branchId?: number;
}

export interface TaskSessionAttachment {
    attachmentId: number;
    attachmentUrl: string;
}

export interface TaskSessionItem {
    id: number;
    date: string;
    status: string;
    taskId: number;
    taskTitle: string;
    taskDescription: string | null;
    sessionScore: number;
    managerComment: string;
    userId: number;
    userName: string;
    attachments: TaskSessionAttachment[];
}

export interface TaskSessionExistRequest {
    branchId: number;
    type: string;
}

export interface CreateTaskSessionRequest {
    type: string;
    branchId: number;
}

export interface UpdateSessionPayload {
    sessionId: number;
    status: string;
}

export class TaskSession extends BaseApiService {
    private static readonly BASE_PATH = '/task-sessions';

    static async getTaskSession(params?: TaskSessionFilter) {
        return this.get<TaskSessionItem[]>(`${this.BASE_PATH}`, { params });
    }

    static async checkTaskSessionExists(params: TaskSessionExistRequest) {
        return this.get<{ exists: boolean }>(`${this.BASE_PATH}/exists`, { params });
    }

    static async createTaskSession(payload: CreateTaskSessionRequest) {
        return this.post<{ sessionId: number }>(`${this.BASE_PATH}`, payload);
    }

    static async updateSessions(payload: UpdateSessionPayload[]) {
        return this.put<{ success: boolean }>(`${this.BASE_PATH}`, payload);
    }

    static async uploadImage(sessionId: number, files: File[]) {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        return this.put<{ success: boolean; attachments: TaskSessionAttachment[] }>(
            `${this.BASE_PATH}/upload/${sessionId}`, formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    }
}