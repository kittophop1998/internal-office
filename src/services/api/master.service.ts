import { BaseApiService } from "./base.service";

export interface Department {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
}

export interface Role {
    id: number;
    code: string;
    name: string;
    description?: string;
}

export interface BranchItem {
    id: number;
    name: string;
    location: string;
}

export interface Branch {
    branches: BranchItem[];
}

export interface TaskGroup {
    id: number;
    name: string;
    percent_weight: number;
}

export interface MasterDataResponse {
    departments: Department[];
    roles: Role[];
    branches: BranchItem[];
    taskGroups: TaskGroup[];
};

export class MasterDataService extends BaseApiService {
    private static readonly BASE_PATH = '/master';

    static async getBranches() {
        const response = await this.get<Branch>(`${this.BASE_PATH}/branches`);
        return response.branches;
    }

    static async getMasterBranches() {
        const response = await this.get<MasterDataResponse>(`${this.BASE_PATH}`);
        return response.branches;
    }

    static async getDepartments() {
        const response = await this.get<MasterDataResponse>(`${this.BASE_PATH}`);
        return response.departments;
    }

    static async getRoles() {
        const response = await this.get<MasterDataResponse>(`${this.BASE_PATH}`);
        return response.roles;
    }

    static async getTaskGroups() {
        const response = await this.get<MasterDataResponse>(`${this.BASE_PATH}`);
        return response.taskGroups;
    }
}