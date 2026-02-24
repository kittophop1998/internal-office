import { User, UserService, UpdateUserPayload, CreateUserPayload } from "@/services/api/user.service";
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

export function useUsers(
    options?: Omit<UseQueryOptions<User[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<User[], Error>({
        queryKey: ['users'],
        queryFn: () => UserService.fetchAll(),
        ...options,
    })
}

export function useUser(
    userId: string,
    options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<User, Error>({
        queryKey: ['user', userId],
        queryFn: () => UserService.fetchById(userId),
        ...options,
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: UpdateUserPayload }) =>
            UserService.update(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserPayload) => UserService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (userId: string) => UserService.deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}