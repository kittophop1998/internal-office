import { BaseApiService } from "./base.service";

export interface Department {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
}

export interface Position {
    id: number;
    code: string;
    title: string;
    description?: string;
}

export interface Branch {
    id: number;
    name: string;
    location: string;
}

export interface TaskGroup {
    id: number;
    name: string;
    percent_weight: number;
}

export interface MasterDataResponse {
    departments: Department[];
    positions: Position[];
    branches: Branch[];
    taskGroups: TaskGroup[];
};

export class MasterDataService extends BaseApiService {
    private static readonly BASE_PATH = '/master';

    static async getBranches() {
        const response = await this.get<MasterDataResponse>(`${this.BASE_PATH}`);
        return response.branches;
    }

    static async getDepartments() {
        const response = await this.get<MasterDataResponse>(`${this.BASE_PATH}`);
        return response.departments;
    }

    static async getPositions() {
        const response = await this.get<MasterDataResponse>(`${this.BASE_PATH}`);
        return response.positions;
    }

    static async getTaskGroups() {
        const response = await this.get<MasterDataResponse>(`${this.BASE_PATH}`);
        return response.taskGroups;
    }
}