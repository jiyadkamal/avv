import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const snap = await adminDb.collection('earnings')
            .where('profile_id', '==', user.id)
            .orderBy('created_at', 'desc')
            .get();
        const earnings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ earnings });
    } catch (error: any) {
        console.error('GET earnings error:', error);
        return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
    }
}
