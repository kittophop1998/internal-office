import { AuthResponse, AuthService, LoginCredentials } from "@/services/api/auth.service";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useAuth(
    options?: Omit<UseMutationOptions<AuthResponse, Error, LoginCredentials>, 'mutationFn'>
) {
    return useMutation<AuthResponse, Error, LoginCredentials>({
        mutationFn: (credentials) => AuthService.login(credentials),
        onSuccess: async (data, variables, context, ...rest) => {
            // Fallback รองรับกรณี backend return field ชื่อ 'token' แทน 'accessToken'
            const token = data.accessToken || data.token || '';
            if (token) {
                localStorage.setItem('accessToken', token);
            }
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userRole', data.user.roleCode);
            if (data.user.currentBranchId != null) {
                localStorage.setItem('currentBranchId', data.user.currentBranchId.toString());
            } else {
                localStorage.removeItem('currentBranchId');
            }

            await options?.onSuccess?.(data, variables, context, ...rest);
        },
        ...options,
    })
}

export function useLogout() {
    const router = useRouter();

    const logout = () => {
        AuthService.logout();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('currentBranchId');
        router.push('/');
    };

    return { logout };
}