import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../axiosClient';
import { queryKeys, DocumentFilters } from '../queryKeys';
import { Documento } from '../../models/Documento';

export function useDocumentos(filters: DocumentFilters, enabled: boolean = true) {
    return useQuery({
        queryKey: queryKeys.documentos.list(filters),
        queryFn: async () => {
            const response = await apiClient.get<Documento[]>('/documentos', {
                params: {
                    fechaInicio: filters.fechaInicio,
                    fechaTermino: filters.fechaTermino,
                    fk_tipoDoc: filters.fk_tipoDoc,
                    fk_categoria: filters.fk_categoria,
                    searchPhrase: filters.searchPhrase,
                    searchPhraseIgnoreOtherFilters: filters.searchPhraseIgnoreOtherFilters,
                },
            });
            return response.data;
        },
        enabled,
    });
}

export function useDocumento(id: number) {
    return useQuery({
        queryKey: queryKeys.documentos.detail(id),
        queryFn: async () => {
            const response = await apiClient.get<Documento[]>('/documentos', {
                params: { id: [id] },
            });
            return response.data[0];
        },
        enabled: !!id,
    });
}

export function useCreateDocumento() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            fk_categoria: number | null;
            proposito: string;
            fecha: string;
            monto: number;
            fk_tipoDoc: number;
        }) => {
            const response = await apiClient.post('/documentos', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documentos.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
        },
    });
}

export function useUpdateDocumento() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            id: number;
            fk_categoria: number | null;
            proposito: string;
            fecha: string;
            monto: number;
            fk_tipoDoc: number;
        }) => {
            const response = await apiClient.put('/documentos', data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documentos.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.documentos.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
        },
    });
}

export function useDeleteDocumento(filters: DocumentFilters) {
    const queryClient = useQueryClient();
    const queryKey = queryKeys.documentos.list(filters);

    return useMutation({
        mutationFn: async (id: number) => {
            await apiClient.delete('/documentos', { data: { id } });
            return id;
        },
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({ queryKey });

            const previousDocs = queryClient.getQueryData<Documento[]>(queryKey);

            queryClient.setQueryData<Documento[]>(queryKey, (old) => {
                if (!old) return [];
                return old.filter((doc) => doc.id !== id)
            });

            return { previousDocs };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(queryKey, context?.previousDocs);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documentos.lists() });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
        },
    });
}
