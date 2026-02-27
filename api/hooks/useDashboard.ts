import { useQueries } from '@tanstack/react-query';
import apiClient from '../axiosClient';
import { queryKeys } from '../queryKeys';
import { MonthlyGraphData } from '../../models/MonthlyGraphData';
import { ExpensesByCategoryData } from '../../models/ExpensesByCategoryData';

interface CurrMonthSpending {
    porcentajeUsado: number;
    topGastos: any[];
}

export function useDashboardQueries() {
    const results = useQueries({
        queries: [
            {
                queryKey: queryKeys.dashboard.monthlyGraph(5),
                queryFn: async () => {
                    const response = await apiClient.get<MonthlyGraphData>('/monthly-graph', {
                        params: { nMonths: 5 },
                    });
                    return response.data;
                },
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: queryKeys.dashboard.expensesByCategory(12),
                queryFn: async () => {
                    const response = await apiClient.get<ExpensesByCategoryData>('/expenses-by-category', {
                        params: { nMonths: 12 },
                    });
                    return response.data;
                },
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: queryKeys.dashboard.currMonthSpending(),
                queryFn: async () => {
                    const response = await apiClient.get<CurrMonthSpending>('/curr-month-spending');
                    return response.data;
                },
                staleTime: 2 * 60 * 1000,
            },
        ],
    });

    const isLoading = results.some((r) => r.isLoading);
    const isError = results.some((r) => r.isError);
    const isRefetching = results.some((r) => r.isRefetching);

    return {
        monthlyGraph: results[0].data as MonthlyGraphData | undefined,
        expensesByCategory: results[1].data as ExpensesByCategoryData | undefined,
        currMonthSpending: results[2].data as CurrMonthSpending | undefined,
        isLoading,
        isError,
        isRefetching,
        refetch: () => Promise.all(results.map((r) => r.refetch())),
    };
}
