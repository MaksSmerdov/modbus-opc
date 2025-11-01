import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  }),
  tagTypes: [
    'Ports',         // Порты
    'Devices',       // Устройства
    'Tags',          // Тэги устройств
    'DeviceData',    // Real-time данные
    'DeviceHistory', // Исторические данные
  ],
  endpoints: () => ({}),
});

