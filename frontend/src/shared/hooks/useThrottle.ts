import { useRef, useCallback, useState, useEffect } from 'react';

/**
 * Хук для throttling функции с отслеживанием состояния загрузки
 * @param callback - функция для throttling
 * @param delay - задержка в миллисекундах
 * @returns объект с throttled функцией и состоянием загрузки
 */
export function useThrottle<T extends (...args: unknown[]) => void>(
    callback: T,
    delay: number
): { throttledFn: T; isLoading: boolean } {
    const lastRun = useRef<number>(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const clearTimers = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (loadingTimerRef.current) {
            clearTimeout(loadingTimerRef.current);
            loadingTimerRef.current = null;
        }
    }, []);

    const throttledFn = useCallback(
        ((...args: Parameters<T>) => {
            const now = Date.now();
            const timeSinceLastRun = now - lastRun.current;

            clearTimers();

            if (timeSinceLastRun >= delay) {
                lastRun.current = now;
                setIsLoading(true);
                callback(...args);
                loadingTimerRef.current = setTimeout(() => {
                    setIsLoading(false);
                    loadingTimerRef.current = null;
                }, delay);
            } else {
                setIsLoading(true);
                const remainingTime = delay - timeSinceLastRun;

                timeoutRef.current = setTimeout(() => {
                    lastRun.current = Date.now();
                    callback(...args);
                    loadingTimerRef.current = setTimeout(() => {
                        setIsLoading(false);
                        loadingTimerRef.current = null;
                    }, 100);
                    timeoutRef.current = null;
                }, remainingTime);
            }
        }) as T,
        [callback, delay, clearTimers]
    );

    // Очистка таймеров при размонтировании
    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, [clearTimers]);

    return { throttledFn, isLoading };
}

