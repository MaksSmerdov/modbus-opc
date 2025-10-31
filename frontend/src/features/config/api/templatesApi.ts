import { baseApi } from '@/app/api/baseApi';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  RegisterTemplate,
  CreateRegisterTemplateDto,
  UpdateRegisterTemplateDto,
  Register,
} from '../types/config.types';

/**
 * API для работы с шаблонами регистров
 */
export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Получить все шаблоны
     * @param deviceType - фильтр по типу устройства (опционально)
     */
    getTemplates: builder.query<ApiResponse<RegisterTemplate[]>, string | void>({
      query: (deviceType) => ({
        url: '/config/templates',
        params: deviceType ? { deviceType } : undefined,
      }),
      providesTags: ['Templates'],
    }),

    /**
     * Получить шаблон по ID
     */
    getTemplate: builder.query<ApiResponse<RegisterTemplate>, string>({
      query: (id) => `/config/templates/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Templates', id }],
    }),

    /**
     * Создать новый шаблон
     */
    createTemplate: builder.mutation<ApiResponse<RegisterTemplate>, CreateRegisterTemplateDto>({
      query: (body) => ({
        url: '/config/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Templates'],
    }),

    /**
     * Обновить шаблон
     */
    updateTemplate: builder.mutation<
      ApiResponse<RegisterTemplate>,
      { id: string; data: UpdateRegisterTemplateDto }
    >({
      query: ({ id, data }) => ({
        url: `/config/templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Templates', id },
        'Templates',
      ],
    }),

    /**
     * Удалить шаблон
     */
    deleteTemplate: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/config/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Templates'],
    }),

    /**
     * Обновить конкретный регистр в шаблоне
     */
    updateRegister: builder.mutation<
      ApiResponse<RegisterTemplate>,
      { templateId: string; registerIndex: number; data: Partial<Register> }
    >({
      query: ({ templateId, registerIndex, data }) => ({
        url: `/config/templates/${templateId}/registers/${registerIndex}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { templateId }) => [
        { type: 'Templates', id: templateId },
        'Templates',
        'Devices',
        'DeviceData',
      ],
    }),
  }),
});

/**
 * Экспортируем автоматически сгенерированные хуки
 */
export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateRegisterMutation,
} = templatesApi;

