import { baseApi } from '../../../shared/api/baseApi';

export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  entityType: 'device' | 'port' | 'tag' | 'user' | 'polling';
  entityName: string;
  oldValue: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DeleteAuditLogResponse {
  success: boolean;
  message: string;
  deletedCount?: number;
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      AuditLogsResponse,
      {
        page?: number;
        limit?: number;
        entityType?: string;
      }
    >({
      query: (params) => ({
        url: '/audit',
        params
      }),
      providesTags: ['AuditLogs']
    }),
    deleteAuditLog: builder.mutation<
      DeleteAuditLogResponse,
      string
    >({
      query: (id) => ({
        url: `/audit/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['AuditLogs']
    }),
    deleteAllAuditLogs: builder.mutation<
      DeleteAuditLogResponse,
      void
    >({
      query: () => ({
        url: '/audit',
        method: 'DELETE'
      }),
      invalidatesTags: ['AuditLogs']
    }),
    deleteAuditLogsByDate: builder.mutation<
      DeleteAuditLogResponse,
      string
    >({
      query: (date) => ({
        url: '/audit',
        method: 'DELETE',
        params: { date }
      }),
      invalidatesTags: ['AuditLogs']
    })
  })
});

export const { 
  useGetAuditLogsQuery,
  useDeleteAuditLogMutation,
  useDeleteAllAuditLogsMutation,
  useDeleteAuditLogsByDateMutation
} = auditApi;

