import { CreateTaskSessionRequest, TaskSession, TaskSessionItem, TaskSessionFilter } from "@/services/api/tasksession.service";
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

export function useTaskSession(
    filter?: TaskSessionFilter,
    options?: Omit<UseQueryOptions<TaskSessionItem[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<TaskSessionItem[], Error>({
        queryKey: ['taskSessions', filter],
        queryFn: () => TaskSession.getTaskSession(filter),
        enabled: !!filter?.branchId,
        ...options,
    });
}

export function useCreateTaskSession(
    options?: Omit<UseMutationOptions<{ sessionId: number }, Error, CreateTaskSessionRequest>, 'mutationFn'>
) {
    const queryClient = useQueryClient();

    return useMutation<{ sessionId: number }, Error, CreateTaskSessionRequest>({
        mutationFn: (payload) => TaskSession.createTaskSession(payload),
        onSuccess: async (data, variables, context, ...rest) => {
            await queryClient.invalidateQueries({ queryKey: ['taskSessions'] });

            await options?.onSuccess?.(data, variables, context, ...rest);
        },
        ...options,
    });
}

export function useCheckTaskSessionExists(
    params: { branchId: number; type: string },
    options?: Omit<UseQueryOptions<{ exists: boolean }, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<{ exists: boolean }, Error>({
        queryKey: ['taskSessionExists', params],
        queryFn: () => TaskSession.checkTaskSessionExists(params),
        enabled: !!params.branchId && !!params.type,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 5_000,
        gcTime: 60_000,
        ...options,
    });
}

