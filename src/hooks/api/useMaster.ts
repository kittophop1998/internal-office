import { BranchItem, Department, MasterDataService, Role, TaskGroup } from "@/services/api/master.service";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export function useBranches(
    options?: Omit<UseQueryOptions<BranchItem[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<BranchItem[], Error>({
        queryKey: ['master'],
        queryFn: () => MasterDataService.getBranches(),
        ...options,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 5_000,
        gcTime: 60_000
    })
}

export function useMasterBranches(
    options?: Omit<UseQueryOptions<BranchItem[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<BranchItem[], Error>({
        queryKey: ['master', 'branches'],
        queryFn: () => MasterDataService.getMasterBranches(),
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