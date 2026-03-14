'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import {
    Wrench, FileText, DollarSign, TrendingUp,
    CheckCircle2, Clock, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function WorkshopDashboardPage() {
    const { user, setUser } = useAuthStore();
    const [reports, setReports] = useState<any[]>([]);
    const [earnings, setEarnings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Sync latest user data
                const meRes = await fetch('/api/auth/me');
                if (meRes.ok) {
                    const meData = await meRes.json();
                    if (meData.user) setUser(meData.user);
                }

                const [reportsRes, earningsRes] = await Promise.all([
                    fetch('/api/reports?contributor_id=' + user?.id),
                    fetch('/api/earnings')
                ]);
                const reportsData = await reportsRes.json();
                const earningsData = await earningsRes.json();
                setReports(reportsData.reports || []);
                setEarnings(earningsData.earnings || []);
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        if (user?.id) fetchData();
    }, [user?.id]);

    const totalEarned = earnings.reduce((sum, e) => sum + (e.amount || 0), 0);
    const approvedReports = reports.filter(r => r.status === 'approved').length;
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const workshopReports = reports.filter(r => r.is_workshop_report).length;

    if (!user) return null;

    const statCards = [
        { label: 'Total Reports', value: reports.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Approved', value: approvedReports, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending Review', value: pendingReports, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Total Earned', value: `$${totalEarned.toFixed(2)}`, icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50' },
    ];

    return (
        <DashboardLayout role={UserRole.USER}>
            <FadeInView delay={0.1} className="space-y-8 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">My Workshop</h1>
                        <p className="text-slate-500 font-medium">Manage your workshop reports and track earnings.</p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-xl px-4 py-2.5 font-bold text-sm gap-2 shadow-sm w-fit">
                        <ShieldCheck className="w-4 h-4" /> Verified Workshop
                    </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, i) => (
                        <FadeInView key={stat.label} delay={0.1 + i * 0.05}>
                            <Card className="border-none shadow-sm rounded-[28px] bg-white border border-slate-100 hover:shadow-md transition-all">
                                <CardContent className="p-7">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                        {loading ? '—' : typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                </CardContent>
                            </Card>
                        </FadeInView>
                    ))}
                </div>

                {/* Workshop Earnings Banner */}
                <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-slate-900 text-white">
                    <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workshop Bonus Rate</p>
                            <h2 className="text-4xl font-extrabold tracking-tight">$10.00 <span className="text-lg text-slate-400 font-medium">per approved report</span></h2>
                            <p className="text-sm text-slate-400 font-medium">
                                You've earned <span className="text-emerald-400 font-bold">${totalEarned.toFixed(2)}</span> from {workshopReports} workshop reports
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/user/upload">
                                <Button className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg gap-2 shadow-lg">
                                    New Report <ArrowUpRight className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/user/wallet">
                                <Button variant="ghost" className="rounded-2xl h-14 px-6 text-slate-300 hover:text-white hover:bg-white/5 font-bold gap-2">
                                    <DollarSign className="w-5 h-5" /> Withdraw
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Workshop Reports */}
                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100">
                    <CardHeader className="px-8 py-6 border-b border-slate-50 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                            <Wrench className="w-5 h-5 text-emerald-600" /> Recent Workshop Reports
                        </CardTitle>
                        <Link href="/user/reports">
                            <Button variant="ghost" size="sm" className="text-indigo-600 font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 rounded-xl">
                                View All
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />)}
                            </div>
                        ) : reports.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {reports.slice(0, 6).map((r: any) => (
                                    <div key={r.id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                r.status === 'approved' ? "bg-emerald-50 text-emerald-600" :
                                                    r.status === 'rejected' ? "bg-red-50 text-red-600" :
                                                        "bg-amber-50 text-amber-600"
                                            )}>
                                                {r.status === 'approved' ? <CheckCircle2 className="w-5 h-5" /> :
                                                    r.status === 'rejected' ? <FileText className="w-5 h-5" /> :
                                                        <Clock className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{r.vehicle_make} {r.vehicle_model}</p>
                                                <p className="text-xs text-slate-400 font-medium">
                                                    VIN: ...{r.vehicle_vin?.slice(-6)} • {new Date(r.created_at).toLocaleDateString()}
                                                    {r.service_details && ' • Service recorded'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {r.is_workshop_report && (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-0 rounded-md text-[10px] font-bold uppercase px-2">Workshop</Badge>
                                            )}
                                            <Badge className={cn(
                                                "rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase border-0",
                                                r.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                                                    r.status === 'rejected' ? "bg-red-100 text-red-700" :
                                                        "bg-amber-100 text-amber-700"
                                            )}>
                                                {r.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-16 text-center">
                                <Wrench className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No reports yet</h3>
                                <p className="text-slate-500 mb-6 font-medium">Start submitting workshop reports to earn $10 per approved report.</p>
                                <Link href="/user/upload">
                                    <Button className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-lg">
                                        Submit First Report
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
