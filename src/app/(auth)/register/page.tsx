'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Mail, Lock, User, Loader2, ArrowRight, Car, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

const googleProvider = new GoogleAuthProvider();

export default function RegisterPage() {
    const router = useRouter();
    const { setUser, setSession } = useAuthStore();
    const [fullName, setFullName] = useState('');
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



    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !email || !password) { toast.error('Please fill in all fields'); return; }
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            const data = await createSession(idToken, fullName);

            setUser(data.user);
            setSession({ uid: data.user.id });
            toast.success('Account created successfully!');
            router.push('/user/dashboard');
        } catch (err: any) {
            const msg = err.code === 'auth/email-already-in-use' ? 'An account with this email already exists'
                : err.code === 'auth/weak-password' ? 'Password must be at least 6 characters'
                : err.code === 'auth/invalid-email' ? 'Invalid email address'
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
            router.push('/user/dashboard');
        } catch (err: any) {
            if (err.code !== 'auth/popup-closed-by-user') {
                toast.error('Google sign-in failed');
            }
        }
        setIsGoogleLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 relative overflow-hidden">
                <Image src="/signup-bg-clean.png" alt="Community Background" fill sizes="50vw" className="object-cover opacity-60" priority />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/80 via-emerald-500/20 to-transparent" />
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"><ShieldCheck className="w-7 h-7" /></div><span className="text-2xl font-bold">Vehicle Verify</span></div>
                    <div className="space-y-8">
                        <div><h1 className="text-5xl font-bold leading-tight mb-4">Join Our<br />Community</h1><p className="text-xl text-white/80 max-w-md">Start verifying vehicles or access comprehensive accident history reports today.</p></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"><Car className="w-8 h-8 mb-2" /><p className="font-bold">Contributor</p><p className="text-sm text-white/70">Submit reports & earn rewards</p></div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"><Users className="w-8 h-8 mb-2" /><p className="font-bold">Viewer</p><p className="text-sm text-white/70">Access verified vehicle data</p></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left"><h2 className="text-3xl font-bold tracking-tight mb-2">Create Account</h2><p className="text-muted-foreground">Join Vehicle Verify today.</p></div>

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

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2"><Label className="text-sm font-medium">Full Name</Label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="text" autoComplete="name" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} className="h-14 pl-12 rounded-2xl bg-muted/50 border-none text-base focus-visible:ring-emerald-500" disabled={isLoading} /></div></div>
                        <div className="space-y-2"><Label className="text-sm font-medium">Email</Label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="h-14 pl-12 rounded-2xl bg-muted/50 border-none text-base focus-visible:ring-emerald-500" disabled={isLoading} /></div></div>
                        <div className="space-y-2"><Label className="text-sm font-medium">Password</Label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="h-14 pl-12 rounded-2xl bg-muted/50 border-none text-base focus-visible:ring-emerald-500" disabled={isLoading} /></div></div>
                        <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl text-base font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-5 h-5" /></>}
                        </Button>
                    </form>
                    <div className="text-center"><p className="text-muted-foreground">Already have an account?{' '}<Link href="/login" className="text-emerald-600 font-semibold hover:underline">Sign in</Link></p></div>
                </div>
            </div>
        </div>
    );
}
