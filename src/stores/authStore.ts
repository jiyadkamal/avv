import { create } from 'zustand';
import { UserRole } from '@/types';

interface User {
    id: string;
    email: string;
    full_name?: string;
    role: UserRole;
    avatar_url?: string;
}

interface AuthState {
    user: User | null;
    session: any | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setSession: (session: any | null) => void;
    setLoading: (isLoading: boolean) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setLoading: (isLoading) => set({ isLoading }),
    logout: async () => {
        // This will be handled by the hook
        set({ user: null, session: null });
    },
}));
