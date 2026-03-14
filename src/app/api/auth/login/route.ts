// DEPRECATED: Authentication now uses Firebase Auth.
// This route is kept as a redirect. Use the client-side Firebase Auth + /api/auth/session instead.
import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({ error: 'Please use Firebase Authentication. This endpoint is deprecated.' }, { status: 410 });
}
