import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  UserService,
  User,
  CreateUserDto,
  UpdateUserDto,
} from '@/services/api/example-user.service';
import { PaginatedResponse, PaginationParams } from '@/types/api.types';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

/**
 * Hook สำหรับดึงรายการ users
 * ตัวอย่างการใช้งาน:
 * const { data, isLoading, error } = useUsers({ page: 1, limit: 10 });
 */
export function useUsers(
  params?: PaginationParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<User>, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: userKeys.list(params),
    queryFn: () => UserService.getUsers(params),
    ...options,
  });
}

/**
 * Hook สำหรับดึงข้อมูล user เดียว
 * ตัวอย่างการใช้งาน:
 * const { data: user, isLoading } = useUser(1);
 */
export function useUser(
  id: number,
  options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<User, Error>({
    queryKey: userKeys.detail(id),
    queryFn: () => UserService.getUserById(id),
    enabled: !!id, // จะไม่ fetch ถ้า id เป็น 0 หรือ undefined
    ...options,
  });
}

/**
 * Hook สำหรับสร้าง user ใหม่
 * ตัวอย่างการใช้งาน:
 * const createUser = useCreateUser();
 * createUser.mutate({ name: 'John', email: 'john@example.com', password: '123456' }, {
 *   onSuccess: (data) => console.log('Created:', data),
 *   onError: (error) => console.error(error),
 * });
 */
export function useCreateUser(
  options?: Omit<UseMutationOptions<User, Error, CreateUserDto>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<User, Error, CreateUserDto>({
    ...options,
    mutationFn: (data: CreateUserDto) => UserService.createUser(data),
    onSuccess: async (data, variables, context, ...rest) => {
      // Invalidate และ refetch รายการ users
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // เรียก onSuccess callback ถ้ามี
      await options?.onSuccess?.(data, variables, context, ...rest);
    },
  });
}

/**
 * Hook สำหรับแก้ไขข้อมูล user
 * ตัวอย่างการใช้งาน:
 * const updateUser = useUpdateUser();
 * updateUser.mutate({ id: 1, data: { name: 'Jane' } });
 */
export function useUpdateUser(
  options?: Omit<
    UseMutationOptions<User, Error, { id: number; data: UpdateUserDto }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { id: number; data: UpdateUserDto }>({
    ...options,
    mutationFn: ({ id, data }) => UserService.updateUser(id, data),
    onSuccess: async (data, variables, context, ...rest) => {
      // Invalidate cache ของ user นั้นๆ และรายการ users
      await queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      await options?.onSuccess?.(data, variables, context, ...rest);
    },
  });
}

/**
 * Hook สำหรับลบ user
 * ตัวอย่างการใช้งาน:
 * const deleteUser = useDeleteUser();
 * deleteUser.mutate(1, {
 *   onSuccess: () => console.log('Deleted!'),
 * });
 */
export function useDeleteUser(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    ...options,
    mutationFn: (id: number) => UserService.deleteUser(id),
    onSuccess: async (data, variables, context, ...rest) => {
      // Invalidate cache
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(variables) });
      
      await options?.onSuccess?.(data, variables, context, ...rest);
    },
  });
}
