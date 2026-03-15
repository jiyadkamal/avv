'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
    const router = useRouter();
    const { setUser, setSession } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const createSession = async (idToken: string, fullName?: string) => {
        const res = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken, full_name: fullName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Session failed');
        return data;
    };



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please fill in all fields'); return; }
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            const data = await createSession(idToken);

            setUser(data.user);
            setSession({ uid: data.user.id });
            toast.success('Welcome back!');

            if (data.user.role === 'admin') router.push('/admin/dashboard');
            else router.push('/user/dashboard');
        } catch (err: any) {
            const msg = err.code === 'auth/invalid-credential' ? 'Invalid email or password'
                : err.code === 'auth/user-not-found' ? 'No account found with this email'
                : err.code === 'auth/wrong-password' ? 'Incorrect password'
                : err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.'
                : err.message || 'An unexpected error occurred';
            toast.error(msg);
        }
        setIsLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            const data = await createSession(idToken, result.user.displayName || undefined);
            setUser(data.user);
            setSession({ uid: data.user.id });
            toast.success('Welcome!');
            if (data.user.role === 'admin') router.push('/admin/dashboard');
            else router.push('/user/dashboard');
        } catch (err: any) {
            if (err.code !== 'auth/popup-closed-by-user') {
                toast.error('Google sign-in failed');
            }
        }
        setIsGoogleLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
                <Image src="/auth-bg.png" alt="Background" fill sizes="50vw" className="object-cover opacity-50" priority />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/40 to-transparent" />
                <div className="absolute inset-0 opacity-10"><div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" /><div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl" /></div>
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"><ShieldCheck className="w-7 h-7" /></div><span className="text-2xl font-bold">Vehicle Verify</span></div>
                    <div className="space-y-8"><div><h1 className="text-5xl font-bold leading-tight mb-4">Advanced Accident<br />Verification</h1><p className="text-xl text-white/80 max-w-md">Access real-time vehicle history and accident reports across the national database with end-to-end encryption.</p></div>
                        <div className="flex items-center gap-6"><div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3"><Car className="w-5 h-5" /><span className="font-medium">50K+ Vehicles</span></div><div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3"><ShieldCheck className="w-5 h-5" /><span className="font-medium">Verified Reports</span></div></div></div>
                    <p className="text-sm text-white/60">© 2024 Vehicle Verify. All rights reserved.</p>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8"><div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center"><ShieldCheck className="w-7 h-7 text-primary-foreground" /></div><span className="text-2xl font-bold">Vehicle Verify</span></div>
                    <div className="text-center lg:text-left"><h2 className="text-3xl font-bold tracking-tight mb-2">Sign in</h2><p className="text-muted-foreground">Welcome back. Enter your credentials to access your dashboard.</p></div>

                    {/* Google Sign In */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full h-14 rounded-2xl text-base font-semibold gap-3 border-slate-200 hover:bg-slate-50"
                    >
                        {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                        )}
                        Continue with Google
                    </Button>

                    <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground font-medium">or continue with email</span></div></div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2"><Label className="text-sm font-medium">Email</Label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 pl-12 rounded-2xl bg-muted/50 border-none text-base" disabled={isLoading} /></div></div>
                        <div className="space-y-2"><div className="flex items-center justify-between"><Label className="text-sm font-medium">Password</Label></div><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 pl-12 rounded-2xl bg-muted/50 border-none text-base" disabled={isLoading} /></div></div>
                        <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl text-base font-bold gap-2">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>}</Button>
                    </form>
                    <div className="text-center"><p className="text-muted-foreground">New to Vehicle Verify?{' '}<Link href="/register" className="text-primary font-semibold hover:underline">Create an account</Link></p></div>
                </div>
            </div>
        </div>
    );
}
