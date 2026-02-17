import { TaskReview, UpdateTaskReviewPayload } from "@/services/api/taskreview.service";
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { TaskSessionItem } from "@/services/api/tasksession.service";

export function useTaskReview(
    filter?: { branchId?: number; type?: string },
    options?: Omit<UseQueryOptions<TaskSessionItem[], Error>, 'queryKey' | 'queryFn'    >
) {
    return useQuery<TaskSessionItem[], Error>({
        queryKey: ['taskReviews', filter],
        queryFn: () => TaskReview.getTaskReviews(filter),
        ...options,
    });
}

export function useUpdateTaskReview(
    options?: Omit<UseMutationOptions<TaskSessionItem[], Error, UpdateTaskReviewPayload>, 'mutationFn'>
) {
    return useMutation<TaskSessionItem[], Error, UpdateTaskReviewPayload>({
        mutationFn: (payload) => TaskReview.updateTaskReviews([payload]),
        ...options,
    });
}