'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole, AccountTier } from '@/types';
import { Check, Shield, Loader2, Search, FileText, Zap, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function UpgradePage() {
    const { user, setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: 'premium' }),
            });
            const data = await res.json();

            if (res.ok) {
                setIsSuccess(true);
                toast.success('Payment successful! Account upgraded.');
                if (user) {
                    setUser({ ...user, account_tier: 'premium' as AccountTier });
                }
            } else {
                toast.error(data.error || 'Payment failed');
            }
        } catch (err) {
            toast.error('An error occurred during payment');
        }
        setIsLoading(false);
    };

    if (!user) return null;

    // Already premium
    if (user.account_tier !== AccountTier.FREE && !isSuccess) {
        return (
            <DashboardLayout role={UserRole.USER}>
                <FadeInView delay={0.1} className="max-w-xl mx-auto text-center space-y-6 py-16">
                    <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto">
                        <Shield className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900">You're Already Premium!</h1>
                    <p className="text-slate-500 max-w-sm mx-auto">You have full access to all premium features including unlimited vehicle searches and detailed history reports.</p>
                    <Link href="/user/search">
                        <Button className="rounded-2xl h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg gap-2 mt-4">
                            <Search className="w-5 h-5" /> Start Searching
                        </Button>
                    </Link>
                </FadeInView>
            </DashboardLayout>
        );
    }

    // Payment success screen
    if (isSuccess) {
        return (
            <DashboardLayout role={UserRole.USER}>
                <FadeInView delay={0.1} className="max-w-xl mx-auto text-center space-y-6 py-16">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <Check className="w-14 h-14 text-emerald-600" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900">Payment Successful!</h1>
                    <p className="text-lg text-slate-500 max-w-md mx-auto">
                        Your account has been upgraded to <span className="font-bold text-indigo-600">Premium</span>. You now have access to all premium features.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link href="/user/search">
                            <Button className="rounded-2xl h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg gap-2">
                                <Search className="w-5 h-5" /> Search Vehicles
                            </Button>
                        </Link>
                        <Link href="/user/dashboard">
                            <Button variant="outline" className="rounded-2xl h-14 px-10 border-slate-200 font-bold text-lg gap-2">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>
                </FadeInView>
            </DashboardLayout>
        );
    }

    // Payment page
    return (
        <DashboardLayout role={UserRole.USER}>
            <FadeInView delay={0.1} className="max-w-2xl mx-auto space-y-8 py-8">
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Upgrade to Premium</h1>
                    <p className="text-lg text-slate-500">Unlock full access to vehicle history search and detailed reports.</p>
                </div>

                <Card className="border-none shadow-xl rounded-[32px] overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600" />
                    <CardContent className="p-10 space-y-8">
                        {/* Price */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 rounded-full px-4 py-1.5 font-bold text-sm">
                                <Star className="w-4 h-4" /> Premium Plan
                            </div>
                            <div className="flex items-baseline justify-center gap-1 mt-4">
                                <span className="text-6xl font-black text-slate-900">$10</span>
                                <span className="text-xl text-slate-400 font-medium">/one-time</span>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Everything included</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    'Unlimited vehicle searches',
                                    'Detailed history reports',
                                    'Priority moderation',
                                    'Advanced search filters',
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pay Button */}
                        <Button
                            onClick={handlePayment}
                            disabled={isLoading}
                            className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xl gap-3 shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="w-7 h-7 animate-spin" />
                            ) : (
                                <>Pay $10 <ArrowRight className="w-6 h-6" /></>
                            )}
                        </Button>

                        <p className="text-center text-xs text-slate-400 font-medium">
                            Instant activation • No recurring charges • Secure payment
                        </p>
                    </CardContent>
                </Card>
            </FadeInView>
        </DashboardLayout>
    );
}
