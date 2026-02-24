import { BaseApiService } from "./base.service";
import { Branch } from "./master.service";

export type Position = 'admin' | 'manager' | 'staff';

export interface User {
    id: string;
    fullname: string;
    username: string;
    telephone: string;
    address: string;
    email: string;
    roleName: Position | null;
    roleId?: number | null;
    departmentId?: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    branches: Branch[];
    taskSessionId: string | null;
    positionTitle?: string | null;
    departmentName?: string | null;
    branchName?: string | null;
    branchLocation?: string | null;
}

export interface UpdateUserPayload {
    fullName: string;
    email: string;
    departmentId: number | null;
    roleId: number | null;
    branchIds: number[];
}

export interface CreateUserPayload {
    fullName: string;
    username: string;
    password: string;
    email: string;
    departmentId: number | null;
    roleId: number | null;
    branchIds: number[];
}

export interface UserActionResponse {
    success: boolean;
    message: string;
    data: null;
    timestamp: string;
}

export class UserService extends BaseApiService {
    private static readonly BASE_PATH = '/users';

    static async fetchAll(): Promise<User[]> {
        return this.get<User[]>(`${this.BASE_PATH}`);
    }

    static async fetchById(id: string): Promise<User> {
        return this.get<User>(`${this.BASE_PATH}/${id}`);
    }

    static async update(id: string, data: UpdateUserPayload): Promise<UserActionResponse> {
        return this.put<UserActionResponse>(`${this.BASE_PATH}/${id}`, data);
    }

    static async create(data: CreateUserPayload): Promise<UserActionResponse> {
        return this.post<UserActionResponse>(`${this.BASE_PATH}`, data);
    }

    static async deleteUser(id: string): Promise<{ message: string }> {
        return this.delete<{ message: string }>(`${this.BASE_PATH}/${id}`);
    }
}