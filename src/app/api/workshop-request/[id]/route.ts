import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = await params;
    const workshopId = id;

    try {
        const { status } = await request.json();
        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }
        
        // Update workshop verification status
        await adminDb.collection('workshops').doc(workshopId).update({
            verification_status: status,
            updated_at: new Date().toISOString()
        });

        // If approved, update user profile's is_workshop and workshop_status
        if (status === 'approved') {
            await adminDb.collection('profiles').doc(workshopId).update({
                is_workshop: true,
                workshop_status: 'approved'
            });
        } else {
            await adminDb.collection('profiles').doc(workshopId).update({
                is_workshop: false,
                workshop_status: 'rejected'
            });
        }

        return NextResponse.json({ success: true, status });
    } catch (error: any) {
        console.error('Workshop approval error:', error);
        return NextResponse.json({ error: 'Failed to update workshop status' }, { status: 500 });
    }
}
