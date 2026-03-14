import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUser } from '@/lib/auth';

/**
 * DANGER: This endpoint clears all data in the specified collections.
 * Currently it clears: profiles (except admin), reports, workshops, earnings, saved_reports.
 */
export async function POST(request: NextRequest) {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    try {
        const collections = ['reports', 'workshops', 'earnings', 'saved_reports'];
        
        // Delete all docs in simple collections
        for (const colName of collections) {
            const snap = await adminDb.collection(colName).get();
            const batch = adminDb.batch();
            snap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }

        // Delete profiles except for the current admin
        const profilesSnap = await adminDb.collection('profiles').get();
        const profileBatch = adminDb.batch();
        profilesSnap.docs.forEach(doc => {
            if (doc.id !== user.id) {
                profileBatch.delete(doc.ref);
            }
        });
        await profileBatch.commit();

        return NextResponse.json({ success: true, message: 'Database reset successfully (all data cleared except admin profile).' });
    } catch (error: any) {
        console.error('Reset DB error:', error);
        return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
    }
}
