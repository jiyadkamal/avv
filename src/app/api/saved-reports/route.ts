import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const snap = await adminDb.collection('saved_reports')
            .where('user_id', '==', user.id)
            .orderBy('created_at', 'desc')
            .get();

        const savedEntries = [];
        for (const doc of snap.docs) {
            const data = doc.data();
            const reportDoc = await adminDb.collection('reports').doc(data.report_id).get();
            if (reportDoc.exists) {
                savedEntries.push({
                    id: doc.id,
                    report_id: data.report_id,
                    report: { id: reportDoc.id, ...reportDoc.data() },
                });
            }
        }
        return NextResponse.json({ savedReports: savedEntries });
    } catch (error: any) {
        console.error('GET saved-reports error:', error);
        return NextResponse.json({ error: 'Failed to fetch saved reports' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { report_id } = await request.json();
        if (!report_id) return NextResponse.json({ error: 'report_id required' }, { status: 400 });

        // Check if already saved
        const existing = await adminDb.collection('saved_reports')
            .where('user_id', '==', user.id)
            .where('report_id', '==', report_id)
            .get();

        if (!existing.empty) {
            return NextResponse.json({ error: 'Already saved' }, { status: 409 });
        }

        await adminDb.collection('saved_reports').add({
            user_id: user.id,
            report_id,
            created_at: new Date().toISOString(),
        });
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error: any) {
        console.error('POST saved-reports error:', error);
        return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { report_id } = await request.json();
        const snap = await adminDb.collection('saved_reports')
            .where('user_id', '==', user.id)
            .where('report_id', '==', report_id)
            .get();

        for (const doc of snap.docs) {
            await doc.ref.delete();
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('DELETE saved-reports error:', error);
        return NextResponse.json({ error: 'Failed to remove saved report' }, { status: 500 });
    }
}
