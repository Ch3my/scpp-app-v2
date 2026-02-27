import { useQuery } from '@tanstack/react-query';
import apiClient from '../axiosClient';
import { queryKeys } from '../queryKeys';
import { Categoria } from '../../models/Categoria';
import { TipoDoc } from '../../models/TipoDoc';

export function useCategorias() {
    return useQuery({
        queryKey: queryKeys.lookups.categorias(),
        queryFn: async () => {
            const response = await apiClient.get<Categoria[]>('/categorias');
            return response.data;
        },
        staleTime: Infinity,
        gcTime: Infinity,
    });
}

export function useTipoDocumentos() {
    return useQuery({
        queryKey: queryKeys.lookups.tipoDocumentos(),
        queryFn: async () => {
            const response = await apiClient.get<TipoDoc[]>('/tipo-docs');
            return response.data;
        },
        staleTime: Infinity,
        gcTime: Infinity,
    });
}
