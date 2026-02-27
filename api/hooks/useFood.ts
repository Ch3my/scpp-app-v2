import { useQuery } from '@tanstack/react-query';
import apiClient from '../axiosClient';
import { queryKeys } from '../queryKeys';
import { DateTime } from 'luxon';

export interface FoodItem {
    id: number;
    name: string;
    unit: string;
    quantity: number;
    lastTransactionAt: DateTime | null;
}

export function useFoodItems() {
    return useQuery({
        queryKey: queryKeys.food.itemQuantity(),
        queryFn: async () => {
            const response = await apiClient.get('/food/item-quantity');
            return response.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                unit: item.unit,
                quantity: item.quantity,
                lastTransactionAt: item.last_transaction_at
                    ? DateTime.fromISO(item.last_transaction_at)
                    : null,
            })) as FoodItem[];
        },
        staleTime: 10 * 60 * 1000,
    });
}
