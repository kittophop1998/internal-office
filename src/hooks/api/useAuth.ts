import { AuthResponse, AuthService, LoginCredentials } from "@/services/api/auth.service";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useAuth(
    options?: Omit<UseMutationOptions<AuthResponse, Error, LoginCredentials>, 'mutationFn'>
) {
    return useMutation<AuthResponse, Error, LoginCredentials>({
        mutationFn: (credentials) => AuthService.login(credentials),
        onSuccess: async (data, variables, context, ...rest) => {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            await options?.onSuccess?.(data, variables, context, ...rest);
        },
        ...options,
    })
}

export function useLogout() {
    const router = useRouter();

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('currentBranchId');
        router.push('/login');
    };

    return { logout };
}