'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';

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
        // Check for existing session on mount
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                // Fetch user profile from the profiles table
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, role, avatar_url')
                    .eq('id', session.user.id)
                    .single();

                setSession(session);
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
                    role: (profile?.role as UserRole) || UserRole.SUBSCRIBER,
                    avatar_url: profile?.avatar_url,
                });
            }
            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, role, avatar_url')
                        .eq('id', session.user.id)
                        .single();

                    setSession(session);
                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
                        role: (profile?.role as UserRole) || UserRole.SUBSCRIBER,
                        avatar_url: profile?.avatar_url,
                    });
                } else {
                    setSession(null);
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setSession, setLoading]);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="top-right" richColors />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
