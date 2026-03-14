import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebase/admin';

export async function PATCH(request: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const formData = await request.formData();
        const full_name = formData.get('full_name') as string;
        const avatar = formData.get('avatar') as File;

        const updates: any = { updated_at: new Date().toISOString() };

        if (full_name) updates.full_name = full_name;

        if (avatar && avatar.size > 0) {
            const buffer = Buffer.from(await avatar.arrayBuffer());
            const base64 = buffer.toString('base64');
            updates.avatar_url = `data:${avatar.type};base64,${base64}`;
        }

        await adminDb.collection('profiles').doc(user.id).update(updates);

        // Return updated profile
        const doc = await adminDb.collection('profiles').doc(user.id).get();
        const data = doc.data()!;

        return NextResponse.json({
            user: {
                id: doc.id,
                email: data.email,
                full_name: data.full_name,
                role: data.role,
                account_tier: data.account_tier || 'free',
                is_workshop: data.is_workshop || false,
                workshop_status: data.workshop_status || 'none',
                avatar_url: data.avatar_url || undefined,
            }
        });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
