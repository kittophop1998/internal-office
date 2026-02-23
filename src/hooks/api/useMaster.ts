import { Branch, Department, MasterDataService, Position, TaskGroup } from "@/services/api/master.service";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export function useBranches(
    options?: Omit<UseQueryOptions<Branch[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<Branch[], Error>({
        queryKey: ['master'],
        queryFn: () => MasterDataService.getBranches(),
        ...options,
    })
}

export function useDepartments(
    options?: Omit<UseQueryOptions<Department[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<Department[], Error>({
        queryKey: ['master'],
        queryFn: () => MasterDataService.getDepartments(),
        ...options,
    })
}

export function usePositions(
    options?: Omit<UseQueryOptions<Position[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<Position[], Error>({
        queryKey: ['master'],
        queryFn: () => MasterDataService.getPositions(),
        ...options,
    })
}

export function useTaskGroups(
    options?: Omit<UseQueryOptions<TaskGroup[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<TaskGroup[], Error>({
        queryKey: ['master', 'taskGroups'],
        queryFn: () => MasterDataService.getTaskGroups(),
        ...options,
    })
}