import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminDb } from '@/lib/firebase/admin';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { full_name, email, password, role } = await request.json();

        if (!full_name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Check if email already exists
        const existing = await adminDb.collection('profiles').where('email', '==', email).get();
        if (!existing.empty) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user profile
        const userRole = role === 'contributor' ? 'contributor' : role === 'workshop' ? 'workshop' : 'subscriber';
        const docRef = await adminDb.collection('profiles').add({
            email,
            full_name,
            role: userRole,
            password: hashedPassword,
            created_at: new Date().toISOString(),
        });

        // Update doc with its own ID
        await docRef.update({ id: docRef.id });

        const user = { id: docRef.id, email, full_name, role: userRole };
        const token = signToken(user);

        const response = NextResponse.json({ user }, { status: 201 });
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
