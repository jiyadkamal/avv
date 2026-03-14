import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { tier } = await request.json();
        if (tier !== 'premium') {
            return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
        }

        const userRef = adminDb.collection('profiles').doc(authUser.id);
        await userRef.update({
            account_tier: tier,
            updated_at: new Date().toISOString()
        });

        return NextResponse.json({ success: true, tier });
    } catch (error: any) {
        console.error('Subscription upgrade error:', error);
        return NextResponse.json({ error: 'Failed to upgrade subscription' }, { status: 500 });
    }
}
