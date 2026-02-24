import { Branch, Department, MasterDataService, Role, TaskGroup } from "@/services/api/master.service";
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
        queryKey: ['master', 'department'],
        queryFn: () => MasterDataService.getDepartments(),
        ...options,
    })
}

export function useRoles(
    options?: Omit<UseQueryOptions<Role[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<Role[], Error>({
        queryKey: ['master', 'roles'],
        queryFn: () => MasterDataService.getRoles(),
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