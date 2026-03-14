import { create } from 'zustand';
import { UserRole, AccountTier, WorkshopStatus } from '@/types';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

interface User {
    id: string;
    email: string;
    full_name?: string;
    role: UserRole;
    account_tier: AccountTier;
    is_workshop: boolean;
    workshop_status: WorkshopStatus;
    gst_number?: string;
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
        try {
            // Sign out of Firebase
            await signOut(auth);
            // Clear server session cookie
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout error:', e);
        }
        set({ user: null, session: null });
    },
}));
