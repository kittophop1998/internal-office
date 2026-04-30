import { BaseApiService } from "./base.service";

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    token?: string; // fallback: บาง backend return 'token' แทน 'accessToken'
    user: UserInfo;
}

export interface UserInfo {
    id?: string;
    username?: string;
    fullName: string;
    roleId: number;
    roleCode: string;
    roleName: string;
    currentBranchId: number | null;
}

export class AuthService extends BaseApiService {
    private static readonly BASE_PATH = '/auth';

    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        return this.post<AuthResponse, LoginCredentials>(`${this.BASE_PATH}/login`, credentials);
    }

    static async logout(): Promise<void> {
        return this.post<void, void>(`${this.BASE_PATH}/logout`);
    }
}