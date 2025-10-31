import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  }),
  tagTypes: [
    'Profiles',      // Профили подключений
    'Devices',       // Устройства
    'Templates',     // Шаблоны регистров
    'DeviceData',    // Real-time данные
    'DeviceHistory', // Исторические данные
  ],
  endpoints: () => ({}),
});

