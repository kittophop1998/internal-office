import { BaseApiService } from "./base.service";
import { apiClient } from "@/lib/api/axios-instance";

export type ReportType = "DAILY" | "WEEKLY" | "MONTHLY";

export interface UserReportParams {
    userId: string;
    branchId: string;
    type?: ReportType; // ไม่ส่งหมายถึง all
}

export interface TaskReport {
    name: string;
    weight: string;
    rating: string;
    score: number;
}

export interface OverallCriticalTaskRating {
    percent: number;
    rating: string;
}

export interface UserReport {
    name: string;
    overall_crittical_task_rating: OverallCriticalTaskRating;
    tasksReports: TaskReport[];
}

export class ReportService extends BaseApiService {
    private static readonly BASE_PATH = '/reports';

    static async fetchUserReport(params: UserReportParams): Promise<UserReport> {
        return this.get<UserReport>(`${this.BASE_PATH}/user`, {
            params: {
                userId: params.userId,
                branchId: params.branchId,
                ...(params.type ? { type: params.type } : {}),
            },
        });
    }

    static async exportPdf(params: UserReportParams): Promise<Blob> {
        const response = await apiClient.get(`${this.BASE_PATH}/export-pdf`, {
            params: {
                userId: params.userId,
                branchId: params.branchId,
                ...(params.type ? { type: params.type } : {}),
            },
            responseType: 'blob',
        });
        return response.data as Blob;
    }
}
