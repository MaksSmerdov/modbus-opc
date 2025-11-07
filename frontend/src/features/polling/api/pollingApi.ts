import { baseApi } from '@/shared/api/baseApi';

export interface PollingStatus {
    isPolling: boolean;
    hasManager: boolean;
    isPollingEnabled: boolean;
    pollInterval: number;
    currentPollInterval: number | null;
}

export interface PollingResponse {
    message: string;
    isPolling: boolean;
}

export const pollingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Получить статус опроса
        getPollingStatus: builder.query<PollingStatus, void>({
            query: () => '/polling/status',
            providesTags: ['Polling'],
        }),

        // Запустить опрос
        startPolling: builder.mutation<PollingResponse, void>({
            query: () => ({
                url: '/polling/start',
                method: 'POST',
            }),
            invalidatesTags: ['Polling'],
        }),

        // Остановить опрос
        stopPolling: builder.mutation<PollingResponse, void>({
            query: () => ({
                url: '/polling/stop',
                method: 'POST',
            }),
            invalidatesTags: ['Polling'],
        }),
    }),
});

export const {
    useGetPollingStatusQuery,
    useLazyGetPollingStatusQuery,
    useStartPollingMutation,
    useStopPollingMutation,
} = pollingApi;

