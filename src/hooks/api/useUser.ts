import { User, UserService } from "@/services/api/user.service";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export function useUsers(
    options?: Omit<UseQueryOptions<User[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<User[], Error>({
        queryKey: ['users'],
        queryFn: () => UserService.fetchAll(),
        ...options,
    })
}