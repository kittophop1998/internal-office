import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0, // ไม่ cache — ให้ fetch ใหม่ทุกครั้งที่ mount
        gcTime: 1000 * 60 * 1, // เก็บ cache ใน memory 1 นาที (แต่จะ refetch เมื่อ stale)
        retry: 1, // retry 1 ครั้งถ้า fail
        refetchOnWindowFocus: false, // ไม่ refetch เมื่อ focus window
        refetchOnReconnect: true, // refetch เมื่อ internet กลับมา
        refetchOnMount: true, // refetch ทุกครั้งที่ mount
      },
      mutations: {
        retry: 0, // mutation ไม่ retry
      },
    },
  });
}

// Singleton สำหรับกรณีที่ต้องการใช้นอก React context (เช่น prefetch ใน server)
export const queryClient = makeQueryClient();
