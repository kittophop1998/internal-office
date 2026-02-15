import axios, { AxiosError, AxiosResponse } from 'axios';

// สร้าง axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - สำหรับเพิ่ม token หรือ config อื่นๆ
apiClient.interceptors.request.use(
  (config) => {
    // เพิ่ม Authorization token (ถ้ามี)
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - สำหรับจัดการ error แบบ global
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // จัดการ error แบบ global
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 401:
          // Unauthorized - ลบ token และ redirect ไป login
          localStorage.removeItem('access_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          console.error('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
          break;
        case 404:
          // Not Found
          console.error('ไม่พบข้อมูลที่ต้องการ');
          break;
        case 500:
          // Server Error
          console.error('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
          break;
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function สำหรับ error handling
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || 'เกิดข้อผิดพลาด';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
};
