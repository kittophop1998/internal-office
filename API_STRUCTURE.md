# โครงสร้างการ Call API ด้วย TanStack React Query

## 📁 โครงสร้างไฟล์

```
src/
├── lib/
│   └── api/
│       ├── axios-instance.ts    # Axios config และ interceptors
│       └── query-client.ts      # React Query config
├── services/
│   └── api/
│       ├── base.service.ts              # Base API service class
│       └── example-user.service.ts      # ตัวอย่าง User API service
├── hooks/
│   └── api/
│       └── useUsers.ts          # Custom hooks สำหรับ User API
├── types/
│   └── api.types.ts            # API types และ interfaces
└── components/
    └── providers/
        └── ReactQueryProvider.tsx    # React Query Provider
```

## 🚀 การใช้งาน

### 1. ตั้งค่า Environment Variable

สร้างไฟล์ `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 2. เพิ่ม ReactQueryProvider ใน Layout

```tsx
// src/app/layout.tsx
import { Providers } from '@/components/providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 3. สร้าง API Service

```typescript
// src/services/api/post.service.ts
import { BaseApiService } from './base.service';

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
}

export interface CreatePostDto {
  title: string;
  content: string;
}

export class PostService extends BaseApiService {
  private static readonly BASE_PATH = '/posts';

  static async getPosts() {
    return this.get<Post[]>(this.BASE_PATH);
  }

  static async getPostById(id: number) {
    return this.get<Post>(`${this.BASE_PATH}/${id}`);
  }

  static async createPost(data: CreatePostDto) {
    return this.post<Post, CreatePostDto>(this.BASE_PATH, data);
  }

  static async updatePost(id: number, data: Partial<CreatePostDto>) {
    return this.put<Post>(`${this.BASE_PATH}/${id}`, data);
  }

  static async deletePost(id: number) {
    return this.delete<void>(`${this.BASE_PATH}/${id}`);
  }
}
```

### 4. สร้าง Custom Hooks

```typescript
// src/hooks/api/usePosts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PostService, Post, CreatePostDto } from '@/services/api/post.service';

// Query keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
};

// Hook: ดึงรายการ posts
export function usePosts() {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: () => PostService.getPosts(),
  });
}

// Hook: ดึง post เดียว
export function usePost(id: number) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => PostService.getPostById(id),
    enabled: !!id,
  });
}

// Hook: สร้าง post ใหม่
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostDto) => PostService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

// Hook: แก้ไข post
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePostDto> }) =>
      PostService.updatePost(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

// Hook: ลบ post
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => PostService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}
```

### 5. ใช้งานใน Component

```tsx
'use client';

import { usePosts, useCreatePost } from '@/hooks/api/usePosts';

export default function PostsPage() {
  const { data: posts, isLoading, error } = usePosts();
  const createPost = useCreatePost();

  const handleCreate = () => {
    createPost.mutate(
      {
        title: 'New Post',
        content: 'Hello World',
      },
      {
        onSuccess: (data) => {
          console.log('Created:', data);
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleCreate}>Create Post</button>
      {posts?.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🎯 คุณสมบัติหลัก

### 1. Axios Instance
- **Base URL Configuration**: ตั้งค่า base URL จาก environment variable
- **Request Interceptor**: เพิ่ม Authorization token อัตโนมัติ
- **Response Interceptor**: จัดการ error แบบ global (401, 403, 404, 500)
- **Error Handling**: Helper function สำหรับดึง error message

### 2. React Query Configuration
- **Stale Time**: 5 นาที
- **Cache Time**: 10 นาที
- **Retry**: 1 ครั้งสำหรับ query
- **Refetch on Window Focus**: ปิด
- **Refetch on Reconnect**: เปิด

### 3. Base API Service
- Generic methods: `get`, `post`, `put`, `patch`, `delete`
- Type-safe responses
- Automatic error handling

### 4. Custom Hooks Pattern
- **Query Hooks**: สำหรับดึงข้อมูล (useUsers, useUser)
- **Mutation Hooks**: สำหรับแก้ไขข้อมูล (useCreateUser, useUpdateUser, useDeleteUser)
- **Automatic Cache Invalidation**: invalidate cache อัตโนมัติหลัง mutation
- **Query Keys Management**: จัดการ query keys แบบมีโครงสร้าง

## 📝 ตัวอย่างการใช้งาน

### Query (GET)
```tsx
const { data, isLoading, error, refetch } = useUsers(
  { page: 1, limit: 10 },
  {
    staleTime: 1000 * 60, // 1 นาที
    enabled: true, // เปิด/ปิดการ fetch
  }
);
```

### Mutation (POST, PUT, DELETE)
```tsx
const createUser = useCreateUser();

createUser.mutate(
  { name: 'John', email: 'john@example.com', password: '123456' },
  {
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
  }
);

// ตรวจสอบสถานะ
console.log(createUser.isPending); // กำลัง loading
console.log(createUser.isError); // เกิด error
console.log(createUser.isSuccess); // สำเร็จ
```

### Manual Refetch
```tsx
const queryClient = useQueryClient();

// Refetch specific query
queryClient.invalidateQueries({ queryKey: ['users'] });

// Refetch all queries
queryClient.invalidateQueries();

// Clear cache
queryClient.removeQueries({ queryKey: ['users', 1] });
```

## 🔧 การปรับแต่ง

### เพิ่ม Authentication Token
Token จะถูกเพิ่มอัตโนมัติจาก localStorage ใน `axios-instance.ts`:

```typescript
const token = localStorage.getItem('access_token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

### กำหนดค่า Query เฉพาะ
```typescript
const { data } = useUsers(undefined, {
  staleTime: 1000 * 60 * 10, // 10 นาที
  gcTime: 1000 * 60 * 30, // 30 นาที
  retry: 3, // retry 3 ครั้ง
  refetchInterval: 5000, // refetch ทุก 5 วินาที
  refetchOnWindowFocus: true,
});
```

## 🎨 React Query DevTools

DevTools จะแสดงเฉพาะใน development mode:

```tsx
// แสดงอยู่แล้วใน ReactQueryProvider
{process.env.NODE_ENV === 'development' && (
  <ReactQueryDevtools initialIsOpen={false} position="bottom" />
)}
```

## 📚 อ้างอิง

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Axios Docs](https://axios-http.com/)
- [Next.js Docs](https://nextjs.org/docs)

## 🆘 การแก้ปัญหา

### ปัญหา: CORS Error
ตรวจสอบ backend ว่าอนุญาต CORS หรือไม่

### ปัญหา: 401 Unauthorized
ตรวจสอบว่า token ถูกส่งไปใน header หรือไม่

### ปัญหา: Cache ไม่ update
เรียก `invalidateQueries` หลัง mutation เสร็จสิ้น
