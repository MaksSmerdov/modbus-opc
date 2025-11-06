import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Кастомный baseQuery с обработкой refresh токенов
const baseQuery = fetchBaseQuery({
    baseUrl: baseURL,
    prepareHeaders: (headers) => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }

        if (refreshToken) {
            headers.set('X-Refresh-Token', refreshToken);
        }

        headers.set('Content-Type', 'application/json');
        return headers;
    },
});

// Обертка для обработки refresh токенов
const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    // Обработка нового access токена из заголовка
    const meta = result.meta as { response?: Response } | undefined;
    if (meta?.response?.headers) {
        const newAccessToken = meta.response.headers.get('X-New-Access-Token');
        if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
        }
    }

    // Если получили 401, пытаемся обновить токены
    if (result.error && result.error.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        const endpoint = typeof args === 'string' ? args : args.url;

        // Не пытаемся обновить токен для запросов на refresh/login/register
        if (
            refreshToken &&
            !endpoint.includes('/auth/refresh') &&
            !endpoint.includes('/auth/login') &&
            !endpoint.includes('/auth/register')
        ) {
            // Пытаемся обновить токен
            const refreshResult = await baseQuery(
                {
                    url: '/auth/refresh',
                    method: 'POST',
                    body: { refreshToken },
                },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                const data = refreshResult.data as { data?: { accessToken?: string; refreshToken?: string } };
                if (data.data?.accessToken) {
                    localStorage.setItem('accessToken', data.data.accessToken);
                    if (data.data.refreshToken) {
                        localStorage.setItem('refreshToken', data.data.refreshToken);
                    }

                    // Повторяем исходный запрос
                    result = await baseQuery(args, api, extraOptions);

                    // Обработка нового токена из повторного запроса
                    const retryMeta = result.meta as { response?: Response } | undefined;
                    if (retryMeta?.response?.headers) {
                        const newAccessToken = retryMeta.response.headers.get('X-New-Access-Token');
                        if (newAccessToken) {
                            localStorage.setItem('accessToken', newAccessToken);
                        }
                    }
                } else {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            } else {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        }
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Theme', 'Ports'],
    endpoints: () => ({}),
});

