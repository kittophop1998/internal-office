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

export class UserService extends BaseApiService {
    private static readonly BASE_PATH = '/users';

    static async fetchAll(): Promise<User[]> {
        return this.get<User[]>(`${this.BASE_PATH}`);
    }
}