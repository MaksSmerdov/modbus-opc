import { baseApi } from '@/shared/api/baseApi';
import type {
    Tag,
    TagsListResponse,
    TagResponse,
    CreateTagData,
    UpdateTagData,
} from '@/features/settings/tag/types';

export const tagsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Получить список всех тэгов устройства
        getTags: builder.query<Tag[], string>({
            query: (deviceId) => `/config/devices/${deviceId}/tags`,
            providesTags: (_result, _error, deviceId) => [
                { type: 'Tags', id: `LIST-${deviceId}` },
            ],
            transformResponse: (response: TagsListResponse) => response.data,
        }),

        // Получить тэг по ID
        getTag: builder.query<Tag, { deviceId: string; tagId: string }>({
            query: ({ deviceId, tagId }) => `/config/devices/${deviceId}/tags/${tagId}`,
            providesTags: (_result, _error, { tagId }) => [{ type: 'Tags', id: tagId }],
            transformResponse: (response: TagResponse) => response.data,
        }),

        // Создать новый тэг
        // deviceId передается в URL, а не в теле запроса
        createTag: builder.mutation<Tag, { deviceId: string; data: Omit<CreateTagData, 'deviceId'> }>({
            query: ({ deviceId, data }) => ({
                url: `/config/devices/${deviceId}/tags`,
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: TagResponse) => response.data,
            invalidatesTags: (_result, _error, { deviceId }) => [
                { type: 'Tags', id: `LIST-${deviceId}` },
                'Tags',
            ],
        }),

        // Обновить тэг
        updateTag: builder.mutation<
            Tag,
            { deviceId: string; tagId: string; data: UpdateTagData }
        >({
            query: ({ deviceId, tagId, data }) => ({
                url: `/config/devices/${deviceId}/tags/${tagId}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: TagResponse) => response.data,
            invalidatesTags: (_result, _error, { deviceId, tagId }) => [
                { type: 'Tags', id: tagId },
                { type: 'Tags', id: `LIST-${deviceId}` },
                'Tags',
            ],
        }),

        // Удалить тэг
        deleteTag: builder.mutation<
            { success: true; message: string },
            { deviceId: string; tagId: string }
        >({
            query: ({ deviceId, tagId }) => ({
                url: `/config/devices/${deviceId}/tags/${tagId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { deviceId, tagId }) => [
                { type: 'Tags', id: tagId },
                { type: 'Tags', id: `LIST-${deviceId}` },
                'Tags',
            ],
        }),
    }),
});

export const {
    useGetTagsQuery,
    useLazyGetTagsQuery,
    useGetTagQuery,
    useLazyGetTagQuery,
    useCreateTagMutation,
    useUpdateTagMutation,
    useDeleteTagMutation,
} = tagsApi;
