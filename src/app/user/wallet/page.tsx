'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { 
    DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, 
    Gift, ChevronRight, Loader2, X, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function UserWalletPage() {
    const { user } = useAuthStore();
    const [earnings, setEarnings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRedeem, setShowRedeem] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [redeemAmount, setRedeemAmount] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawSuccess, setWithdrawSuccess] = useState(false);

    useEffect(() => {
        fetchEarnings();
    }, []);

    async function fetchEarnings() {
        try { 
            const res = await fetch('/api/earnings'); 
            const data = await res.json(); 
            setEarnings(data.earnings || []); 
        }
        catch (e) { console.error(e); }
        setLoading(false);
    }

    const totalBalance = earnings.reduce((sum, e) => sum + (e.amount || 0), 0);
    const creditEarnings = earnings.filter(e => (e.amount || 0) > 0);
    const withdrawals = earnings.filter(e => (e.amount || 0) < 0);

    const handleWithdraw = async () => {
        const amount = parseFloat(redeemAmount);
        if (!upiId.includes('@')) {
            toast.error('Please enter a valid UPI ID (e.g. name@upi)');
            return;
        }
        if (!amount || amount <= 0) {
            toast.error('Enter a valid amount');
            return;
        }
        if (amount > totalBalance) {
            toast.error('Insufficient balance');
            return;
        }

        setIsWithdrawing(true);
        try {
            const res = await fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, upi_id: upiId }),
            });
            const data = await res.json();

            if (res.ok) {
                setWithdrawSuccess(true);
                toast.success(`$${amount.toFixed(2)} withdrawn to ${upiId}`);
                // Refresh earnings
                await fetchEarnings();
                setTimeout(() => {
                    setShowRedeem(false);
                    setWithdrawSuccess(false);
                    setUpiId('');
                    setRedeemAmount('');
                }, 2000);
            } else {
                toast.error(data.error || 'Withdrawal failed');
            }
        } catch (err) {
            toast.error('An error occurred');
        }
        setIsWithdrawing(false);
    };

    if (!user) return null;

    return (
        <DashboardLayout role={UserRole.USER}>
            <FadeInView delay={0.1} className="space-y-8 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">My Rewards</h1>
                    <p className="text-slate-500">Manage your earnings and withdraw to your UPI.</p>
                </div>

                {/* Main Balance Card */}
                <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-slate-900 text-white">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                            <div className="flex-1 p-10 space-y-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Balance</p>
                                    <h2 className="text-5xl font-extrabold mt-2 tracking-tight">
                                        ${totalBalance.toFixed(2)}
                                    </h2>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <Button 
                                        onClick={() => { setShowRedeem(true); setWithdrawSuccess(false); }}
                                        disabled={totalBalance <= 0}
                                        className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg gap-2 shadow-lg shadow-indigo-900/40"
                                    >
                                        Redeem Now <ArrowUpRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="md:w-72 bg-white/5 backdrop-blur-sm p-10 flex flex-col justify-between border-l border-white/10">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Earned</p>
                                        <p className="text-xl font-bold mt-1 text-slate-200">
                                            ${creditEarnings.reduce((s, e) => s + (e.amount || 0), 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Withdrawn</p>
                                        <p className="text-xl font-bold mt-1 text-red-400">
                                            ${Math.abs(withdrawals.reduce((s, e) => s + (e.amount || 0), 0)).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Redeem Modal Overlay */}
                {showRedeem && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !isWithdrawing && setShowRedeem(false)}>
                        <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl" onClick={e => e.stopPropagation()}>
                            <CardContent className="p-8 space-y-6">
                                {withdrawSuccess ? (
                                    <div className="text-center space-y-4 py-4">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                            <Check className="w-10 h-10 text-emerald-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">Withdrawal Successful!</h3>
                                        <p className="text-slate-500">Your funds will be transferred to your UPI shortly.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-slate-900">Withdraw Funds</h3>
                                            <button onClick={() => setShowRedeem(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available</p>
                                            <p className="text-3xl font-black text-slate-900 mt-1">${totalBalance.toFixed(2)}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold">Amount ($)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="1"
                                                    max={totalBalance}
                                                    placeholder="Enter amount"
                                                    value={redeemAmount}
                                                    onChange={e => setRedeemAmount(e.target.value)}
                                                    className="h-12 rounded-xl text-lg font-bold"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setRedeemAmount(totalBalance.toFixed(2))}
                                                    className="text-xs text-indigo-600 font-bold hover:underline"
                                                >
                                                    Withdraw All
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold">UPI ID</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="yourname@upi"
                                                    value={upiId}
                                                    onChange={e => setUpiId(e.target.value)}
                                                    className="h-12 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleWithdraw}
                                            disabled={isWithdrawing || !upiId || !redeemAmount}
                                            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg gap-2 shadow-lg"
                                        >
                                            {isWithdrawing ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <>Withdraw ${redeemAmount || '0.00'}</>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Stats Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm rounded-2xl border border-slate-100 bg-white">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Gift className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Reward Per Report</p>
                                <p className="text-xl font-bold text-slate-900">{user.is_workshop ? '$10.00' : '$5.00'}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm rounded-2xl border border-slate-100 bg-white">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Earning Cycle</p>
                                <p className="text-xl font-bold text-slate-900">Immediate</p>
                            </div>
                        </CardContent>
                    </Card>
                    {!user.is_workshop && (
                        <Link href="/user/workshop-apply" className="group">
                            <Card className="border-none shadow-sm rounded-2xl border border-indigo-100 bg-indigo-50/20 group-hover:bg-indigo-50 transition-colors">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-indigo-900">Earn $10 / report</p>
                                            <p className="text-xs text-indigo-700/70 font-medium">Become a workshop</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-indigo-300 group-hover:text-indigo-600 transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    )}
                </div>

                {/* Transaction History */}
                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100">
                    <CardHeader className="px-8 py-6 bg-slate-50/50 border-b border-slate-50">
                        <CardTitle className="text-xl font-bold flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-emerald-600" /> Transaction History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : earnings.length > 0 ? (
                            <div className="space-y-3">
                                {earnings.map((e, i) => {
                                    const isWithdrawal = (e.amount || 0) < 0;
                                    return (
                                        <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50/30 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform",
                                                    isWithdrawal ? "bg-red-50" : "bg-emerald-50"
                                                )}>
                                                    {isWithdrawal 
                                                        ? <ArrowDownRight className="w-5 h-5 text-red-600" />
                                                        : <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                                                    }
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-base font-bold text-slate-900">{e.reason || 'Report Incentive'}</p>
                                                        {isWithdrawal && <Badge className="bg-red-100 text-red-700 border-0 rounded-md px-1.5 py-0 text-[10px] font-bold uppercase">Withdrawal</Badge>}
                                                    </div>
                                                    <p className="text-xs font-medium text-slate-400">{new Date(e.created_at).toLocaleDateString()} • Ref: #{e.id?.slice(0, 8) || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={cn(
                                                    "text-lg font-black",
                                                    isWithdrawal ? "text-red-600" : "text-emerald-600"
                                                )}>
                                                    {isWithdrawal ? '-' : '+'}${Math.abs(e.amount || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                                <DollarSign className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No earnings yet</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
                                    Your approved accident reports will automatically credit your wallet. Start reporting to earn.
                                </p>
                                <Link href="/user/upload">
                                    <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg shadow-xl shadow-indigo-100">
                                        Submit Report
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </FadeInView>
        </DashboardLayout>
    );
}
