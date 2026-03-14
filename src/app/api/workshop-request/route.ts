import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const formData = await request.formData();
        const gst_number = formData.get('gst_number') as string;
        const name = formData.get('name') as string;
        const state = formData.get('state') as string;
        const district = formData.get('district') as string;
        const description = formData.get('description') as string;
        const workshop_image = formData.get('workshop_image') as File;

        if (!gst_number || !name || !state || !district) {
            return NextResponse.json({ error: 'Missing required workshop details' }, { status: 400 });
        }

        // Process image if provided, convert to base64 for simplicity (as requested/existing pattern)
        let workshop_image_url = '';
        if (workshop_image && workshop_image.size > 0) {
            const buffer = Buffer.from(await workshop_image.arrayBuffer());
            const base64 = buffer.toString('base64');
            workshop_image_url = `data:${workshop_image.type};base64,${base64}`;
        }

        // Create workshop request (or update if exists)
        const workshopRef = adminDb.collection('workshops').doc(user.id);
        await workshopRef.set({
            id: user.id,
            owner_id: user.id,
            user_name: user.full_name,
            user_email: user.email,
            workshop_name: name,
            gst_number,
            state,
            district,
            address: `${district}, ${state}`, // Combined address for UI
            description: description || '',
            workshop_image: workshop_image_url,
            verification_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, { merge: true });

        // Update user profile status
        await adminDb.collection('profiles').doc(user.id).update({
            workshop_status: 'pending',
            gst_number: gst_number
        });

        return NextResponse.json({ success: true, status: 'pending' });
    } catch (error: any) {
        console.error('Workshop request error:', error);
        return NextResponse.json({ error: 'Failed to submit workshop request' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        // Fetch all pending workshops without orderBy to avoid index errors
        const snap = await adminDb.collection('workshops')
            .where('verification_status', '==', 'pending')
            .get();
        
        // Sort in-memory instead
        const requests = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a: any, b: any) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

        return NextResponse.json({ requests });
    } catch (error: any) {
        console.error('GET workshop requests error:', error);
        return NextResponse.json({ error: 'Failed to fetch workshop requests' }, { status: 500 });
    }
}
