'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { Wallet, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';

interface Earning {
    id: string;
    amount: number;
    status: string;
    created_at: string;
}

export default function WalletPage() {
    const { user } = useAuthStore();
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [pendingEarnings, setPendingEarnings] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEarnings() {
            if (!user?.id) return;

            const { data, error } = await supabase
                .from('earnings')
                .select('id, amount, status, created_at')
                .eq('profile_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setEarnings(data);
                const total = data.filter(e => e.status === 'paid').reduce((sum, e) => sum + Number(e.amount), 0);
                const pending = data.filter(e => e.status === 'pending').reduce((sum, e) => sum + Number(e.amount), 0);
                setTotalEarnings(total);
                setPendingEarnings(pending);
            }
            setLoading(false);
        }
        fetchEarnings();
    }, [user?.id]);

    return (
        <DashboardLayout role={UserRole.CONTRIBUTOR}>
            <FadeInView delay={0.1} className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Wallet</h1>
                    <p className="text-muted-foreground">Track your earnings from verified reports.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden bg-gradient-to-br from-green-500/10 to-green-500/5">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center">
                                <DollarSign className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Earned</p>
                                <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center">
                                <Clock className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Pending</p>
                                <p className="text-3xl font-bold">${pendingEarnings.toFixed(2)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Per Report</p>
                                <p className="text-3xl font-bold">$5.00</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Your earning history from approved reports.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 bg-muted/20 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : earnings.length > 0 ? (
                            <div className="space-y-4">
                                {earnings.map((earning) => (
                                    <div key={earning.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                <DollarSign className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Report Reward</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(earning.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-500">+${Number(earning.amount).toFixed(2)}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{earning.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No transactions yet. Start submitting reports to earn!</p>
                        )}
                    </CardContent>
                </Card>

                {/* Withdraw Button */}
                <div className="flex justify-end">
                    <Button className="rounded-2xl h-12 px-8 font-bold" disabled={totalEarnings < 10}>
                        Withdraw Funds
                    </Button>
                </div>
            </FadeInView>
        </DashboardLayout>
    );
}
