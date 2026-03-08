import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        const doc = await adminDb.collection('reports').doc(id).get();
        if (!doc.exists) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

        const report = { id: doc.id, ...doc.data() };

        // Optionally fetch contributor profile
        const data = doc.data();
        if (data?.contributor_id) {
            const profileDoc = await adminDb.collection('profiles').doc(data.contributor_id).get();
            if (profileDoc.exists) {
                (report as any).contributor = {
                    full_name: profileDoc.data()?.full_name,
                    email: profileDoc.data()?.email,
                };
            }
        }

        return NextResponse.json({ report });
    } catch (error: any) {
        console.error('GET report error:', error);
        return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = await params;

    try {
        const body = await request.json();
        const updates: any = {};
        if (body.status) {
            updates.status = body.status;
            if (body.status === 'approved') {
                updates.verified_at = new Date().toISOString();
                // Create earning for contributor
                const reportDoc = await adminDb.collection('reports').doc(id).get();
                if (reportDoc.exists) {
                    await adminDb.collection('earnings').add({
                        profile_id: reportDoc.data()?.contributor_id,
                        amount: 5.00,
                        status: 'approved',
                        report_id: id,
                        created_at: new Date().toISOString(),
                    });
                }
            }
        }

        await adminDb.collection('reports').doc(id).update(updates);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('PATCH report error:', error);
        return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
    }
}
