import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const contributorId = searchParams.get('contributor_id');
    const vin = searchParams.get('vin');
    const plate = searchParams.get('plate');
    const limitParam = parseInt(searchParams.get('limit') || '50');

    try {
        let q: FirebaseFirestore.Query = adminDb.collection('reports');

        if (status) q = q.where('status', '==', status);
        if (contributorId) q = q.where('contributor_id', '==', contributorId);
        if (vin) q = q.where('vehicle_vin', '==', vin);
        if (plate) q = q.where('vehicle_plate', '==', plate);

        q = q.orderBy('created_at', 'desc').limit(limitParam);
        const snap = await q.get();
        const reports = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ reports });
    } catch (error: any) {
        console.error('GET reports error:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const formData = await request.formData();
        const vehicle_vin = formData.get('vehicle_vin') as string;
        const vehicle_plate = formData.get('vehicle_plate') as string;
        const vehicle_make = formData.get('vehicle_make') as string;
        const vehicle_model = formData.get('vehicle_model') as string;
        const description = formData.get('description') as string;
        const severity = formData.get('severity') as string;
        const accident_date = formData.get('accident_date') as string;
        const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null;
        const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null;

        // Encode images as base64 data URIs (stored directly in Firestore)
        const imageDataUrls: string[] = [];
        const imageFiles = formData.getAll('images') as File[];
        for (const file of imageFiles) {
            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const base64 = buffer.toString('base64');
                const dataUrl = `data:${file.type};base64,${base64}`;
                imageDataUrls.push(dataUrl);
            }
        }

        const docRef = await adminDb.collection('reports').add({
            contributor_id: user.id,
            vehicle_vin: vehicle_vin?.toUpperCase() || '',
            vehicle_plate: vehicle_plate?.toUpperCase() || '',
            vehicle_make: vehicle_make || '',
            vehicle_model: vehicle_model || '',
            description: description || '',
            severity: severity || '',
            accident_date: accident_date || '',
            latitude,
            longitude,
            images: imageDataUrls,
            status: 'pending',
            created_at: new Date().toISOString(),
        });

        return NextResponse.json({ id: docRef.id }, { status: 201 });
    } catch (error: any) {
        console.error('POST report error:', error);
        return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
    }
}
