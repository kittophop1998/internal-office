import { ReportService, UserReport, UserReportParams } from "@/services/api/report.service";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export function useUserReport(
    params: UserReportParams,
    options?: Omit<UseQueryOptions<UserReport, Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery<UserReport, Error>({
        queryKey: ['report', 'user', params.userId, params.branchId, params.type ?? 'ALL'],
        queryFn: () => ReportService.fetchUserReport(params),
        enabled: !!params.userId && !!params.branchId,
        ...options,
    });
}
