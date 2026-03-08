import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminDb } from '@/lib/firebase/admin';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Find user by email
        const snapshot = await adminDb.collection('profiles').where('email', '==', email).get();
        if (snapshot.empty) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const doc = snapshot.docs[0];
        const userData = doc.data();

        // Verify password
        const isValid = await bcrypt.compare(password, userData.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const user = {
            id: doc.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
        };

        const token = signToken(user);

        const response = NextResponse.json({ user });
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
