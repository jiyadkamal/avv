'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
    const router = useRouter();
    const { setUser, setSession } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please fill in all fields'); return; }
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) { toast.error(data.error || 'Login failed'); setIsLoading(false); return; }

            setUser(data.user);
            setSession({ uid: data.user.id });
            toast.success('Welcome back!');

            if (data.user.role === 'admin') router.push('/admin/dashboard');
            else if (data.user.role === 'contributor') router.push('/contributor/dashboard');
            else if (data.user.role === 'workshop') router.push('/workshop/dashboard');
            else router.push('/subscriber/dashboard');
        } catch (err: any) {
            toast.error('An unexpected error occurred');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-700" />
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
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2"><Label className="text-sm font-medium">Email</Label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 pl-12 rounded-2xl bg-muted/50 border-none text-base" disabled={isLoading} /></div></div>
                        <div className="space-y-2"><div className="flex items-center justify-between"><Label className="text-sm font-medium">Password</Label><Link href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link></div><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 pl-12 rounded-2xl bg-muted/50 border-none text-base" disabled={isLoading} /></div></div>
                        <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl text-base font-bold gap-2">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>}</Button>
                    </form>
                    <div className="text-center"><p className="text-muted-foreground">New to Vehicle Verify?{' '}<Link href="/register" className="text-primary font-semibold hover:underline">Create an account</Link></p></div>
                </div>
            </div>
        </div>
    );
}
