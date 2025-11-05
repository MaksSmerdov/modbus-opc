import { baseApi } from '@/shared/api/baseApi';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: { data: AuthResponse }) => {
        const data = response.data;
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        return data;
      },
      invalidatesTags: ['User'],
    }),

    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: { data: AuthResponse }) => {
        const data = response.data;
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        return data;
      },
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch }) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch(authApi.util.resetApiState());
      },
      invalidatesTags: ['User'],
    }),

    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
      transformResponse: (response: { data: User }) => response.data,
    }),

    updateSettings: builder.mutation<{ theme: string }, { theme?: string }>({
      query: (settings) => ({
        url: '/users/me/settings',
        method: 'PUT',
        body: settings,
      }),
      transformResponse: (response: { data: { theme: string } }) => response.data,
      invalidatesTags: ['User', 'Theme'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateSettingsMutation,
} = authApi;
