import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase/admin';

const SESSION_EXPIRY = 60 * 60 * 24 * 7 * 1000; // 7 days in ms

export async function POST(request: NextRequest) {
    try {
        const { idToken, full_name } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
        }

        // Verify the Firebase ID token first
        const decoded = await admin.auth().verifyIdToken(idToken);
        const uid = decoded.uid;
        const email = decoded.email || '';

        // Create a long-lived session cookie (7 days)
        const sessionCookie = await admin.auth().createSessionCookie(idToken, {
            expiresIn: SESSION_EXPIRY,
        });

        // Check if profile already exists
        const profileDoc = await admin.firestore().collection('profiles').doc(uid).get();
        
        if (!profileDoc.exists) {
            // Create new profile
            await admin.firestore().collection('profiles').doc(uid).set({
                id: uid,
                email,
                full_name: full_name || decoded.name || email.split('@')[0],
                role: 'user',
                account_tier: 'free',
                is_workshop: false,
                workshop_status: 'none',
                created_at: new Date().toISOString(),
            });
        }

        const doc = await admin.firestore().collection('profiles').doc(uid).get();
        const data = doc.data()!;

        const user = {
            id: uid,
            email: data.email,
            full_name: data.full_name,
            role: data.role || 'user',
            account_tier: data.account_tier || 'free',
            is_workshop: data.is_workshop || false,
            workshop_status: data.workshop_status || 'none',
        };

        // Set the session cookie
        const response = NextResponse.json({ user });
        response.cookies.set('firebase_token', sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Auth session error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
}
