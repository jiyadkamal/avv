'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { FileText, DollarSign, CheckCircle2, Clock, TrendingUp, ChevronRight, Plus, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ContributorDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({ totalReports: 0, pendingReports: 0, approvedReports: 0, totalEarnings: 0 });
    const [recentReports, setRecentReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user?.id) { setLoading(false); return; }
            try {
                const [reportsRes, earningsRes] = await Promise.all([fetch(`/api/reports?contributor_id=${user.id}`), fetch('/api/earnings')]);
                const reportsData = await reportsRes.json();
                const earningsData = await earningsRes.json();
                const reports = reportsData.reports || [];
                const earnings = earningsData.earnings || [];
                const pending = reports.filter((r: any) => r.status === 'pending');
                const approved = reports.filter((r: any) => r.status === 'approved');
                const totalEarnings = earnings.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
                setStats({ totalReports: reports.length, pendingReports: pending.length, approvedReports: approved.length, totalEarnings });
                setRecentReports(reports.slice(0, 5));
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchData();
    }, [user?.id]);

    const statCards = [
        { label: 'Total Reports', value: stats.totalReports, icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
        { label: 'Pending', value: stats.pendingReports, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        { label: 'Approved', value: stats.approvedReports, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Earnings', value: `$${stats.totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'bg-violet-50 text-violet-600', isString: true },
    ];

    return (
        <DashboardLayout role={UserRole.CONTRIBUTOR}>
            <FadeInView delay={0.1} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
                        <p className="text-slate-500 text-sm">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}. Here's your contribution overview.</p>
                    </div>
                    <Link href="/contributor/upload">
                        <Button className="rounded-lg h-10 px-5 font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
                            <Plus className="w-4 h-4" />New Report
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statCards.map((stat, i) => (
                        <FadeInView key={stat.label} delay={0.1 + i * 0.05}>
                            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color)}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        {stat.label === 'Earnings' && <TrendingUp className="w-4 h-4 text-violet-400" />}
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{loading ? '—' : (stat.isString ? stat.value : (stat.value as number).toLocaleString())}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
                                </CardContent>
                            </Card>
                        </FadeInView>
                    ))}
                </div>

                <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between px-6 py-5 pb-3">
                        <CardTitle className="text-lg font-semibold text-slate-900">Recent Reports</CardTitle>
                        <Link href="/contributor/reports">
                            <Button variant="ghost" size="sm" className="rounded-lg text-indigo-600 font-medium text-sm gap-1 hover:bg-indigo-50">
                                View All <ChevronRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />)}</div>
                            : recentReports.length > 0 ? <div className="space-y-3">{recentReports.map((r: any) => (
                                <Link key={r.id} href={`/contributor/reports/${r.id}`}>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center",
                                                r.status === 'approved' ? "bg-emerald-50 text-emerald-600" :
                                                    r.status === 'rejected' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600")}>
                                                {r.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 text-sm">{r.vehicle_make} {r.vehicle_model}</p>
                                                <p className="text-xs text-slate-500">VIN: ...{r.vehicle_vin?.slice(-6) || 'N/A'} • {new Date(r.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Badge className={cn("rounded-full font-medium text-xs border-0 capitalize",
                                            r.status === 'approved' ? "bg-emerald-50 text-emerald-700" : r.status === 'rejected' ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")}>
                                            {r.status}
                                        </Badge>
                                    </div>
                                </Link>
                            ))}</div>
                                : <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="font-semibold text-slate-900 mb-1">No reports yet</p>
                                    <p className="text-slate-500 text-sm mb-4">Submit your first accident report to start earning.</p>
                                    <Link href="/contributor/upload"><Button className="rounded-lg h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium gap-1"><Plus className="w-4 h-4" />New Report</Button></Link>
                                </div>}
                    </CardContent>
                </Card>
            </FadeInView>
        </DashboardLayout>
    );
}
