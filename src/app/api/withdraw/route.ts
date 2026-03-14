import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { amount, upi_id } = await request.json();

        if (!upi_id || !amount || amount <= 0) {
            return NextResponse.json({ error: 'Valid UPI ID and amount required' }, { status: 400 });
        }

        // Fetch user earnings to verify balance
        const snap = await adminDb.collection('earnings')
            .where('profile_id', '==', user.id)
            .get();

        const totalEarnings = snap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

        if (amount > totalEarnings) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // Record withdrawal as a negative earning
        await adminDb.collection('earnings').add({
            profile_id: user.id,
            amount: -amount,
            reason: `Withdrawal to UPI: ${upi_id}`,
            status: 'approved',
            type: 'withdrawal',
            upi_id,
            created_at: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, withdrawn: amount });
    } catch (error: any) {
        console.error('Withdraw error:', error);
        return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
    }
}
