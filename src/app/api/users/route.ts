import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const snap = await adminDb.collection('profiles').orderBy('created_at', 'desc').get();
        const users = snap.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, email: data.email, full_name: data.full_name, role: data.role, created_at: data.created_at };
        });
        return NextResponse.json({ users });
    } catch (error: any) {
        console.error('GET users error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
