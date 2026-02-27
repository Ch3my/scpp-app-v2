import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../axiosClient';
import { queryKeys } from '../queryKeys';
import { Asset } from '../../models/Asset';

export function useAssets() {
    return useQuery({
        queryKey: queryKeys.assets.list(),
        queryFn: async () => {
            const response = await apiClient.get<Asset[]>('/assets');
            return response.data;
        },
    });
}

export function useAsset(id: number) {
    return useQuery({
        queryKey: queryKeys.assets.detail(id),
        queryFn: async () => {
            const response = await apiClient.get<Asset[]>('/assets', {
                params: { id: [id] },
            });
            return response.data[0];
        },
        enabled: !!id,
    });
}

export function useCreateAsset() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            fk_categoria: number | null;
            descripcion: string;
            assetData: string;
            fecha: string;
        }) => {
            const response = await apiClient.post('/assets', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.lists() });
        },
    });
}

export function useDeleteAsset() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await apiClient.delete('/assets', { data: { id } });
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
        },
    });
}
