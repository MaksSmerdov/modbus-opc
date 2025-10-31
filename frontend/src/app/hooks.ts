import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * Typed хуки для Redux
 * 
 * Используйте эти хуки вместо обычных useDispatch и useSelector
 * для автоматической типизации
 */

// Typed версия useDispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// Typed версия useSelector
export const useAppSelector = useSelector.withTypes<RootState>();

