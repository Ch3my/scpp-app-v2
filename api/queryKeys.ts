export interface DocumentFilters {
    fechaInicio?: string;
    fechaTermino?: string;
    fk_tipoDoc?: number;
    fk_categoria?: number | null;
    searchPhrase?: string;
    searchPhraseIgnoreOtherFilters?: boolean;
}

export const queryKeys = {
    // Auth
    auth: {
        all: ['auth'] as const,
        session: () => [...queryKeys.auth.all, 'session'] as const,
    },

    // Dashboard
    dashboard: {
        all: ['dashboard'] as const,
        monthlyGraph: (nMonths: number) =>
            [...queryKeys.dashboard.all, 'monthly-graph', { nMonths }] as const,
        expensesByCategory: (nMonths: number) =>
            [...queryKeys.dashboard.all, 'expenses-by-category', { nMonths }] as const,
        currMonthSpending: () =>
            [...queryKeys.dashboard.all, 'curr-month-spending'] as const,
    },

    // Documents
    documentos: {
        all: ['documentos'] as const,
        lists: () => [...queryKeys.documentos.all, 'list'] as const,
        list: (filters: DocumentFilters) =>
            [...queryKeys.documentos.lists(), filters] as const,
        details: () => [...queryKeys.documentos.all, 'detail'] as const,
        detail: (id: number) => [...queryKeys.documentos.details(), id] as const,
    },

    // Assets
    assets: {
        all: ['assets'] as const,
        lists: () => [...queryKeys.assets.all, 'list'] as const,
        list: () => [...queryKeys.assets.lists()] as const,
        details: () => [...queryKeys.assets.all, 'detail'] as const,
        detail: (id: number) => [...queryKeys.assets.details(), id] as const,
    },

    // Food
    food: {
        all: ['food'] as const,
        itemQuantity: () => [...queryKeys.food.all, 'item-quantity'] as const,
    },

    // Lookups (stable data)
    lookups: {
        all: ['lookups'] as const,
        categorias: () => [...queryKeys.lookups.all, 'categorias'] as const,
        tipoDocumentos: () => [...queryKeys.lookups.all, 'tipo-docs'] as const,
    },
} as const;
