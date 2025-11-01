import { baseApi } from '@/app/api/baseApi';
import type { PollingStatus, PollingResponse } from '../types/polling.types';

export const pollingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPollingStatus: builder.query<PollingStatus, void>({
      query: () => '/polling/status',
      providesTags: ['Polling'],
    }),
    startPolling: builder.mutation<PollingResponse, void>({
      query: () => ({
        url: '/polling/start',
        method: 'POST',
      }),
      invalidatesTags: ['Polling'],
    }),
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
  useStartPollingMutation,
  useStopPollingMutation,
} = pollingApi;

