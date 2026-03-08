import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const ownerId = searchParams.get('owner_id');

    try {
        let q: FirebaseFirestore.Query = adminDb.collection('workshops');

        if (ownerId) q = q.where('owner_id', '==', ownerId);
        if (state) q = q.where('state', '==', state);
        if (district) q = q.where('district', '==', district);

        q = q.orderBy('created_at', 'desc').limit(50);
        const snap = await q.get();
        let workshops = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Client-side name filter (Firestore doesn't support substring search)
        if (name) {
            const lower = name.toLowerCase();
            workshops = workshops.filter((w: any) => w.name?.toLowerCase().includes(lower));
        }

        return NextResponse.json({ workshops });
    } catch (error: any) {
        console.error('GET workshops error:', error);
        return NextResponse.json({ error: 'Failed to fetch workshops' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'workshop') return NextResponse.json({ error: 'Only workshop owners can create listings' }, { status: 403 });

    try {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const state = formData.get('state') as string;
        const district = formData.get('district') as string;
        const description = formData.get('description') as string;

        if (!name || !state || !district) {
            return NextResponse.json({ error: 'Name, state, and district are required' }, { status: 400 });
        }

        // Encode images as base64 data URIs
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

        // Check if user already has a workshop listing
        const existing = await adminDb.collection('workshops').where('owner_id', '==', user.id).get();

        if (!existing.empty) {
            // Update existing listing
            const docId = existing.docs[0].id;
            const updateData: any = {
                name,
                state,
                district,
                description: description || '',
                updated_at: new Date().toISOString(),
            };
            if (imageDataUrls.length > 0) {
                updateData.images = imageDataUrls;
            }
            await adminDb.collection('workshops').doc(docId).update(updateData);
            return NextResponse.json({ id: docId, updated: true });
        } else {
            // Create new listing
            const docRef = await adminDb.collection('workshops').add({
                owner_id: user.id,
                name,
                state,
                district,
                description: description || '',
                images: imageDataUrls,
                created_at: new Date().toISOString(),
            });
            return NextResponse.json({ id: docRef.id }, { status: 201 });
        }
    } catch (error: any) {
        console.error('POST workshop error:', error);
        return NextResponse.json({ error: 'Failed to save workshop' }, { status: 500 });
    }
}
