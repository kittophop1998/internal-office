import { AxiosRequestConfig } from 'axios';
import { apiClient, getErrorMessage } from '@/lib/api/axios-instance';
import { ApiResponse } from '@/types/api.types';

/**
 * Base API Service
 * มี method พื้นฐานสำหรับการ call API
 */
export class BaseApiService {
  /**
   * GET request
   */
  protected static async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * POST request
   */
  protected static async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * PUT request
   */
  protected static async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await apiClient.put<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * PATCH request
   */
  protected static async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * DELETE request
   */
  protected static async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}
