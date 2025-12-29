import { baseApi } from '@/shared/api/baseApi';

export type LogLevel = 'log' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  deviceName?: string;
  portName?: string;
  error?: string;
  [key: string]: unknown;
}

export interface LogsResponse {
  success: boolean;
  data: LogEntry[];
  count: number;
}

export const logsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLogs: builder.query<LogEntry[], { limit?: number; level?: LogLevel }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.level) searchParams.set('level', params.level);
        return `/console?${searchParams.toString()}`;
      },
      transformResponse: (response: LogsResponse): LogEntry[] => {
        return response.data || [];
      },
      providesTags: ['Logs'],
    }),
    clearLogs: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/console',
        method: 'DELETE',
      }),
      invalidatesTags: ['Logs'],
    }),
  }),
});

export const {
  useGetLogsQuery,
  useClearLogsMutation,
} = logsApi;

