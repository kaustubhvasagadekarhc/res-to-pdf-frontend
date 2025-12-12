'use client';

import { useState, useCallback } from "react";
import { AxiosError } from "axios";

// interface UseApiState<T> {
//     data: T | null;
//     isLoading: boolean;
//     error: string | null;
// }

export function useApi<T = unknown>() {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async (apiCall: () => Promise<T>) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await apiCall();
            setData(result);
            return result;
        } catch (err: unknown) {
            let errorMessage = "An unexpected error occurred";
            if (err instanceof AxiosError) {
                errorMessage = err.response?.data?.message || err.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        data,
        isLoading,
        error,
        execute,
        reset: useCallback(() => {
            setData(null);
            setError(null);
            setIsLoading(false);
        }, []),
    };
}
