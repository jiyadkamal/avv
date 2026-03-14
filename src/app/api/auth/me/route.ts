import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import admin from '@/lib/firebase/admin';

export async function GET() {
    const authUser = await getAuthUser();
    if (!authUser) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    // Always return fresh data from Firestore
    try {
        const doc = await admin.firestore().collection('profiles').doc(authUser.id).get();
        if (!doc.exists) {
            return NextResponse.json({ user: null }, { status: 401 });
        }
        const data = doc.data()!;
        const user = {
            id: doc.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role || 'user',
            account_tier: data.account_tier || 'free',
            is_workshop: data.is_workshop || false,
            workshop_status: data.workshop_status || 'none',
            gst_number: data.gst_number || undefined,
            avatar_url: data.avatar_url || undefined,
        };
        return NextResponse.json({ user });
    } catch {
        return NextResponse.json({ user: authUser });
    }
}
