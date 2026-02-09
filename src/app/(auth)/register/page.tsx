'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, User, Loader2, ArrowRight, Car, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
    const router = useRouter();
    const { setUser, setSession } = useAuthStore();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'contributor' | 'subscriber'>('subscriber');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                },
            });

            if (error) {
                toast.error(error.message);
                setIsLoading(false);
                return;
            }

            if (data.user) {
                // Create/update profile with role
                console.log('Creating profile with role:', role);
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: data.user.id,
                    email: email,
                    full_name: fullName,
                    role: role,
                }, { onConflict: 'id' });

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                } else {
                    console.log('Profile created successfully with role:', role);
                }

                const userWithRole = {
                    id: data.user.id,
                    email: data.user.email || '',
                    role: role,
                    full_name: fullName,
                };

                setUser(userWithRole as any);
                if (data.session) {
                    setSession(data.session);
                }

                toast.success('Account created successfully!');

                if (role === 'contributor') {
                    router.push('/contributor/dashboard');
                } else {
                    router.push('/subscriber/dashboard');
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            toast.error('An unexpected error occurred');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-300 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <span className="text-2xl font-bold">Vehicle Verify</span>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h1 className="text-5xl font-bold leading-tight mb-4">
                                Join Our<br />Community
                            </h1>
                            <p className="text-xl text-white/80 max-w-md">
                                Start verifying vehicles or access comprehensive accident history reports today.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                <Car className="w-8 h-8 mb-2" />
                                <p className="font-bold">For Contributors</p>
                                <p className="text-sm text-white/70">Submit reports & earn rewards</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                <Users className="w-8 h-8 mb-2" />
                                <p className="font-bold">For Subscribers</p>
                                <p className="text-sm text-white/70">Access verified vehicle data</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-white/60">
                        © 2024 Vehicle Verify. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                            <ShieldCheck className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold">Vehicle Verify</span>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Create Account</h2>
                        <p className="text-muted-foreground">
                            Join Vehicle Verify and start your journey.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="h-14 pl-12 rounded-2xl bg-muted/50 border-none text-base"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-14 pl-12 rounded-2xl bg-muted/50 border-none text-base"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-14 pl-12 rounded-2xl bg-muted/50 border-none text-base"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Account Type</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('subscriber')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all text-left",
                                        role === 'subscriber'
                                            ? "border-primary bg-primary/5"
                                            : "border-muted hover:border-muted-foreground/30"
                                    )}
                                >
                                    <Users className={cn("w-6 h-6 mb-2", role === 'subscriber' ? "text-primary" : "text-muted-foreground")} />
                                    <p className="font-bold text-sm">Subscriber</p>
                                    <p className="text-xs text-muted-foreground">Search vehicles</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('contributor')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all text-left",
                                        role === 'contributor'
                                            ? "border-primary bg-primary/5"
                                            : "border-muted hover:border-muted-foreground/30"
                                    )}
                                >
                                    <Car className={cn("w-6 h-6 mb-2", role === 'contributor' ? "text-primary" : "text-muted-foreground")} />
                                    <p className="font-bold text-sm">Contributor</p>
                                    <p className="text-xs text-muted-foreground">Submit & earn</p>
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 rounded-2xl text-base font-bold gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
