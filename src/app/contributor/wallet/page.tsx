'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { DollarSign, TrendingUp, Download, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export default function WalletPage() {
    const { user } = useAuthStore();
    const [earnings, setEarnings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEarnings() {
            try { const res = await fetch('/api/earnings'); const data = await res.json(); setEarnings(data.earnings || []); }
            catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchEarnings();
    }, []);

    const totalEarned = earnings.reduce((sum, e) => sum + (e.amount || 0), 0);

    return (
        <DashboardLayout role={UserRole.CONTRIBUTOR}>
            <FadeInView delay={0.1} className="space-y-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Rewards</h1>
                    <p className="text-slate-500 text-sm">Track your earnings from approved reports.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { label: 'Total Earned', value: `$${totalEarned.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
                        { label: 'Transactions', value: earnings.length, icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600' },
                        { label: 'Available', value: `$${totalEarned.toFixed(2)}`, icon: Wallet, color: 'bg-violet-50 text-violet-600' },
                    ].map((stat, i) => (
                        <FadeInView key={stat.label} delay={0.1 + i * 0.05}>
                            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                                <CardContent className="p-5">
                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", stat.color)}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{loading ? '—' : stat.value}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
                                </CardContent>
                            </Card>
                        </FadeInView>
                    ))}
                </div>

                <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                    <CardHeader className="px-6 py-5 pb-3">
                        <CardTitle className="text-lg font-semibold text-slate-900">Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-50 rounded-lg animate-pulse" />)}</div>
                            : earnings.length > 0 ? (
                                <div className="space-y-2">
                                    {earnings.map((e: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{e.description || 'Report Reward'}</p>
                                                    <p className="text-xs text-slate-500">{new Date(e.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="font-semibold text-emerald-600">+${(e.amount || 0).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                                    <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="font-semibold text-slate-900 mb-1">No earnings yet</p>
                                    <p className="text-slate-500 text-sm">Rewards will appear here when your reports are approved.</p>
                                </div>
                            )}
                    </CardContent>
                </Card>
            </FadeInView>
        </DashboardLayout>
    );
}
