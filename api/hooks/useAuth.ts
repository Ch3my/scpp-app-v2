import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../axiosClient';
import { queryKeys } from '../queryKeys';

export function useCheckSession(enabled: boolean = true) {
    return useQuery({
        queryKey: queryKeys.auth.session(),
        queryFn: async () => {
            const response = await apiClient.get<{ success: boolean }>('/check-session');
            return response.data;
        },
        enabled,
        retry: false,
        staleTime: 0,
    });
}

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ username, password }: { username: string; password: string }) => {
            const response = await apiClient.post<{ sessionHash: string }>('/login', { username, password });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lookups.all });
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await apiClient.post('/logout', {});
            return response.data;
        },
        onSuccess: () => {
            queryClient.clear();
        },
    });
}
