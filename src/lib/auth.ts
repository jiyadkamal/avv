import { cookies } from 'next/headers';
import admin from '@/lib/firebase/admin';

export interface AuthUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
    account_tier: string;
    is_workshop: boolean;
    workshop_status: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase_token')?.value;
    if (!token) return null;

    try {
        // Verify Firebase session cookie (long-lived, created by createSessionCookie)
        const decoded = await admin.auth().verifySessionCookie(token, true);
        const uid = decoded.uid;

        // Get profile from Firestore
        const doc = await admin.firestore().collection('profiles').doc(uid).get();
        if (!doc.exists) return null;

        const data = doc.data()!;
        return {
            id: uid,
            email: data.email || decoded.email || '',
            full_name: data.full_name || '',
            role: data.role || 'user',
            account_tier: data.account_tier || 'free',
            is_workshop: data.is_workshop || false,
            workshop_status: data.workshop_status || 'none',
        };
    } catch (error) {
        console.error('Auth verification failed:', error);
        return null;
    }
}
