'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/stores/authStore';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
            },
        },
    }));

    const { setUser, setSession, setLoading } = useAuthStore();

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                        setSession({ uid: data.user.id });
                    } else {
                        setUser(null);
                        setSession(null);
                    }
                } else {
                    setUser(null);
                    setSession(null);
                }
            } catch {
                setUser(null);
                setSession(null);
            }
            setLoading(false);
        }
        checkAuth();
    }, [setUser, setSession, setLoading]);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="top-right" richColors theme="light" />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
