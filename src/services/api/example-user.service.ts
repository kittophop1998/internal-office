import { BaseApiService } from './base.service';
import { PaginatedResponse, PaginationParams } from '@/types/api.types';

// ตัวอย่าง User Type
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  avatar?: string;
}

/**
 * User API Service
 * ตัวอย่างการสร้าง service สำหรับ User API
 */
export class UserService extends BaseApiService {
  private static readonly BASE_PATH = '/users';

  /**
   * ดึงรายการ users ทั้งหมด (มี pagination)
   */
  static async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return this.get<PaginatedResponse<User>>(this.BASE_PATH, { params });
  }

  /**
   * ดึงข้อมูล user เดียว
   */
  static async getUserById(id: number): Promise<User> {
    return this.get<User>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * สร้าง user ใหม่
   */
  static async createUser(data: CreateUserDto): Promise<User> {
    return this.post<User, CreateUserDto>(this.BASE_PATH, data);
  }

  /**
   * แก้ไขข้อมูล user
   */
  static async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    return this.put<User, UpdateUserDto>(`${this.BASE_PATH}/${id}`, data);
  }

  /**
   * ลบ user
   */
  static async deleteUser(id: number): Promise<void> {
    return this.delete<void>(`${this.BASE_PATH}/${id}`);
  }
}
