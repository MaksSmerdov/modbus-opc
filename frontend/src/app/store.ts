import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';

/**
 * Redux Store с RTK Query
 */
export const store = configureStore({
  reducer: {
    // Добавляем reducer для RTK Query
    [baseApi.reducerPath]: baseApi.reducer,
    
    // Здесь будут другие reducers по мере необходимости
  },
  
  // Добавляем middleware для RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Настраиваем слушатели для refetchOnFocus и refetchOnReconnect
setupListeners(store.dispatch);

// Экспортируем типы для TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

