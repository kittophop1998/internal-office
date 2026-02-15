import { QueryClient } from '@tanstack/react-query';

// สร้าง QueryClient พร้อม config เริ่มต้น
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 นาที
      gcTime: 1000 * 60 * 10, // 10 นาที (เดิมชื่อ cacheTime)
      retry: 1, // retry 1 ครั้งถ้า fail
      refetchOnWindowFocus: false, // ไม่ refetch เมื่อ focus window
      refetchOnReconnect: true, // refetch เมื่อ internet กลับมา
    },
    mutations: {
      retry: 0, // mutation ไม่ retry
    },
  },
});
