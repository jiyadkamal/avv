import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const adminUser = await getAuthUser();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const { tier } = await request.json();

        if (!['free', 'premium', 'pro'].includes(tier)) {
            return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
        }

        await adminDb.collection('profiles').doc(id).update({
            account_tier: tier,
            updated_at: new Date().toISOString()
        });

        return NextResponse.json({ success: true, tier });
    } catch (error: any) {
        console.error('Update tier error:', error);
        return NextResponse.json({ error: 'Failed to update user tier' }, { status: 500 });
    }
}
