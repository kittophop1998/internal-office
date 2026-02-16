import { CreateTaskPayload, TaskItem, TaskService } from "@/services/api/task.service";
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

export function useTasks(
    options?: Omit<UseQueryOptions<TaskItem[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<TaskItem[], Error>({
        queryKey: ['tasks'],
        queryFn: () => TaskService.fetchAll(),
        ...options,
    })
}

export function useTask(
    id: number, 
    options?: Omit<UseQueryOptions<TaskItem, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<TaskItem, Error>({
        queryKey: ['task', id],
        queryFn: () => TaskService.fetchById(id),
        enabled: !!id,
        ...options,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0,
    });
}

export function useDeleteTask(
    options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        ...options,
        mutationFn: (taskId: number) => TaskService.deleteTask(taskId),
        onSuccess: async (data, variables, context, ...rest) => {
            await queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.removeQueries({ queryKey: ['task', variables] });

            await options?.onSuccess?.(data, variables, context, ...rest);
        }
    });
}

export function useCreateTask(
    options?: Omit<UseMutationOptions<TaskItem, Error, CreateTaskPayload>, 'mutationFn'>
) {
    const queryClient = useQueryClient();

    return useMutation<TaskItem, Error, CreateTaskPayload>({
        ...options,
        mutationFn: (payload: CreateTaskPayload) => TaskService.create(payload),
        onSuccess: async (data, variables, context, ...rest) => {
            await queryClient.invalidateQueries({ queryKey: ['tasks'] });
            await queryClient.invalidateQueries({ queryKey: ['task', data.id] });

            await options?.onSuccess?.(data, variables, context, ...rest);
        }
    });
}

export function useUpdateTask(
    options?: Omit<UseMutationOptions<TaskItem, Error, { id: number; data: Partial<CreateTaskPayload> }>, 'mutationFn'>
) {
    const queryClient = useQueryClient();

    return useMutation<TaskItem, Error, { id: number; data: Partial<CreateTaskPayload> }>({
        ...options,
        mutationFn: ({ id, data }) => TaskService.updateTask(id, data),
        onSuccess: async (data, variables, context, ...rest) => {
            await queryClient.invalidateQueries({ queryKey: ['tasks'] });
            await queryClient.invalidateQueries({ queryKey: ['task', variables.id] });

            await options?.onSuccess?.(data, variables, context, ...rest);
        }
    });
}