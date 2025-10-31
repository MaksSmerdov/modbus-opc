import { baseApi } from '@/app/api/baseApi';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  ConnectionProfile,
  CreateConnectionProfileDto,
  UpdateConnectionProfileDto,
} from '../types/config.types';

/**
 * API для работы с профилями подключений
 */
export const profilesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Получить все профили
     */
    getProfiles: builder.query<ApiResponse<ConnectionProfile[]>, void>({
      query: () => '/config/profiles',
      providesTags: ['Profiles'],
    }),

    /**
     * Получить профиль по ID
     */
    getProfile: builder.query<ApiResponse<ConnectionProfile>, string>({
      query: (id) => `/config/profiles/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Profiles', id }],
    }),

    /**
     * Создать новый профиль
     */
    createProfile: builder.mutation<ApiResponse<ConnectionProfile>, CreateConnectionProfileDto>({
      query: (body) => ({
        url: '/config/profiles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profiles'],
    }),

    /**
     * Обновить профиль
     */
    updateProfile: builder.mutation<
      ApiResponse<ConnectionProfile>,
      { id: string; data: UpdateConnectionProfileDto }
    >({
      query: ({ id, data }) => ({
        url: `/config/profiles/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Profiles', id },
        'Profiles',
      ],
    }),

    /**
     * Удалить профиль
     */
    deleteProfile: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/config/profiles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profiles'],
    }),
  }),
});

/**
 * Экспортируем автоматически сгенерированные хуки
 */
export const {
  useGetProfilesQuery,
  useGetProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
} = profilesApi;

