'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import {
    FileText, Users, TrendingUp, Calendar, BarChart3,
    Wrench, ShieldCheck, DollarSign, Activity, ArrowUpRight,
    ArrowDownRight, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeInView } from '@/lib/animations';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        totalReports: 0, totalUsers: 0, approvedReports: 0, pendingReports: 0,
        rejectedReports: 0, workshopUsers: 0, premiumUsers: 0, freeUsers: 0,
        reports: [] as any[], users: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [reportsRes, usersRes, workshopRes] = await Promise.all([
                    fetch('/api/reports'),
                    fetch('/api/users'),
                    fetch('/api/workshop-request')
                ]);
                const reportsData = await reportsRes.json();
                const usersData = await usersRes.json();
                const workshopData = await workshopRes.json();
                const reports = reportsData.reports || [];
                const users = usersData.users || [];

                setStats({
                    totalReports: reports.length,
                    totalUsers: users.length,
                    approvedReports: reports.filter((r: any) => r.status === 'approved').length,
                    pendingReports: reports.filter((r: any) => r.status === 'pending').length,
                    rejectedReports: reports.filter((r: any) => r.status === 'rejected').length,
                    workshopUsers: users.filter((u: any) => u.is_workshop).length,
                    premiumUsers: users.filter((u: any) => u.account_tier === 'premium').length,
                    freeUsers: users.filter((u: any) => !u.account_tier || u.account_tier === 'free').length,
                    reports,
                    users,
                });
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchData();
    }, []);

    // Build monthly report data from actual reports
    const getMonthlyData = () => {
        const months: { [key: string]: { approved: number; pending: number; rejected: number } } = {};
        const now = new Date();
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            months[key] = { approved: 0, pending: 0, rejected: 0 };
        }
        stats.reports.forEach((r: any) => {
            const d = new Date(r.created_at);
            const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            if (months[key]) {
                if (r.status === 'approved') months[key].approved++;
                else if (r.status === 'pending') months[key].pending++;
                else months[key].rejected++;
            }
        });
        return Object.entries(months).map(([month, data]) => ({
            month,
            ...data,
            total: data.approved + data.pending + data.rejected
        }));
    };

    const monthlyData = getMonthlyData();
    const maxMonthly = Math.max(...monthlyData.map(m => m.total), 1);

    const summaryCards = [
        { label: 'Total Reports', value: stats.totalReports, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', change: '+' + stats.pendingReports + ' pending' },
        { label: 'Platform Users', value: stats.totalUsers, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', change: stats.premiumUsers + ' premium' },
        { label: 'Approved Reports', value: stats.approvedReports, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', change: stats.totalReports > 0 ? Math.round((stats.approvedReports / stats.totalReports) * 100) + '% rate' : '0% rate' },
        { label: 'Active Workshops', value: stats.workshopUsers, icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50', change: 'Verified accounts' },
    ];

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Analytics</h1>
                        <p className="text-slate-500 font-medium">Platform performance overview and growth metrics.</p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg px-4 py-2 font-bold text-xs uppercase tracking-widest shadow-sm w-fit">
                        <Activity className="w-4 h-4 mr-2 animate-pulse" /> Live Data
                    </Badge>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {summaryCards.map((card, i) => (
                        <FadeInView key={card.label} delay={0.1 + i * 0.05}>
                            <Card className="border-none shadow-sm rounded-[28px] bg-white border border-slate-100 hover:shadow-md transition-all">
                                <CardContent className="p-7">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", card.bg, card.color)}>
                                            <card.icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                        {loading ? '—' : card.value.toLocaleString()}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{card.label}</p>
                                    <p className="text-xs text-slate-500 mt-2 font-medium">{card.change}</p>
                                </CardContent>
                            </Card>
                        </FadeInView>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Monthly Reports Bar Chart */}
                    <Card className="lg:col-span-2 border-none shadow-sm rounded-[32px] bg-white border border-slate-100">
                        <CardHeader className="px-8 py-6 border-b border-slate-50">
                            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 text-indigo-600" /> Monthly Reports
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-500">Last 6 months activity breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 py-8">
                            {loading ? (
                                <div className="h-64 bg-slate-50 rounded-2xl animate-pulse" />
                            ) : (
                                <div className="space-y-6">
                                    {/* Bar chart */}
                                    <div className="flex items-end gap-3 h-52">
                                        {monthlyData.map((m, i) => (
                                            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">{m.total}</span>
                                                <div className="w-full flex flex-col justify-end rounded-xl overflow-hidden bg-slate-100" style={{ height: '100%' }}>
                                                    <div
                                                        className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 rounded-xl transition-all duration-700 ease-out relative group"
                                                        style={{
                                                            height: `${Math.max((m.total / maxMonthly) * 100, 4)}%`,
                                                            animationDelay: `${i * 100}ms`
                                                        }}
                                                    >
                                                        {m.approved > 0 && (
                                                            <div
                                                                className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-b-xl"
                                                                style={{ height: `${(m.approved / m.total) * 100}%` }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.month}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Legend */}
                                    <div className="flex items-center gap-6 pt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-bold text-slate-500">Approved</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-indigo-600" />
                                            <span className="text-xs font-bold text-slate-500">Pending / Other</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* User Distribution */}
                    <Card className="border-none shadow-sm rounded-[32px] bg-white border border-slate-100">
                        <CardHeader className="px-8 py-6 border-b border-slate-50">
                            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                                <Users className="w-5 h-5 text-violet-600" /> User Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
                                </div>
                            ) : (
                                <>
                                    {/* Donut chart (CSS only) */}
                                    <div className="flex justify-center py-4">
                                        <div className="relative w-40 h-40">
                                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                                                <circle
                                                    cx="18" cy="18" r="15.915" fill="transparent"
                                                    stroke="#6366f1" strokeWidth="3"
                                                    strokeDasharray={`${stats.totalUsers > 0 ? (stats.premiumUsers / stats.totalUsers) * 100 : 0} ${100 - (stats.totalUsers > 0 ? (stats.premiumUsers / stats.totalUsers) * 100 : 0)}`}
                                                    strokeDashoffset="0"
                                                    className="transition-all duration-1000"
                                                />
                                                <circle
                                                    cx="18" cy="18" r="15.915" fill="transparent"
                                                    stroke="#10b981" strokeWidth="3"
                                                    strokeDasharray={`${stats.totalUsers > 0 ? (stats.workshopUsers / stats.totalUsers) * 100 : 0} ${100 - (stats.totalUsers > 0 ? (stats.workshopUsers / stats.totalUsers) * 100 : 0)}`}
                                                    strokeDashoffset={`-${stats.totalUsers > 0 ? (stats.premiumUsers / stats.totalUsers) * 100 : 0}`}
                                                    className="transition-all duration-1000"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-black text-slate-900">{stats.totalUsers}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Free Users', value: stats.freeUsers, color: 'bg-slate-400', icon: Users },
                                            { label: 'Premium Users', value: stats.premiumUsers, color: 'bg-indigo-600', icon: Zap },
                                            { label: 'Workshop Accounts', value: stats.workshopUsers, color: 'bg-emerald-500', icon: Wrench },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-3 h-3 rounded-full", item.color)} />
                                                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-900">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Report Status Breakdown */}
                <Card className="border-none shadow-sm rounded-[32px] bg-white border border-slate-100">
                    <CardHeader className="px-8 py-6 border-b border-slate-50">
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-emerald-600" /> Report Status Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        {loading ? (
                            <div className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
                        ) : (
                            <div className="space-y-6">
                                {/* Horizontal stacked bar */}
                                <div className="h-8 w-full rounded-full overflow-hidden flex bg-slate-100">
                                    {stats.approvedReports > 0 && (
                                        <div
                                            className="bg-emerald-500 h-full transition-all duration-1000 flex items-center justify-center"
                                            style={{ width: `${(stats.approvedReports / Math.max(stats.totalReports, 1)) * 100}%` }}
                                        >
                                            {stats.approvedReports > 2 && <span className="text-[10px] font-bold text-white">{stats.approvedReports}</span>}
                                        </div>
                                    )}
                                    {stats.pendingReports > 0 && (
                                        <div
                                            className="bg-amber-400 h-full transition-all duration-1000 flex items-center justify-center"
                                            style={{ width: `${(stats.pendingReports / Math.max(stats.totalReports, 1)) * 100}%` }}
                                        >
                                            {stats.pendingReports > 2 && <span className="text-[10px] font-bold text-white">{stats.pendingReports}</span>}
                                        </div>
                                    )}
                                    {stats.rejectedReports > 0 && (
                                        <div
                                            className="bg-red-400 h-full transition-all duration-1000 flex items-center justify-center"
                                            style={{ width: `${(stats.rejectedReports / Math.max(stats.totalReports, 1)) * 100}%` }}
                                        >
                                            {stats.rejectedReports > 2 && <span className="text-[10px] font-bold text-white">{stats.rejectedReports}</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Legend */}
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: 'Approved', value: stats.approvedReports, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
                                        { label: 'Pending', value: stats.pendingReports, color: 'bg-amber-400', textColor: 'text-amber-600' },
                                        { label: 'Rejected', value: stats.rejectedReports, color: 'bg-red-400', textColor: 'text-red-600' },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                                            <div className={cn("w-4 h-4 rounded-full shrink-0", item.color)} />
                                            <div>
                                                <p className={cn("text-xl font-black", item.textColor)}>{item.value}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity Feed */}
                <Card className="border-none shadow-sm rounded-[32px] bg-white border border-slate-100">
                    <CardHeader className="px-8 py-6 border-b border-slate-50">
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                            <Activity className="w-5 h-5 text-indigo-600" /> Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
                            </div>
                        ) : stats.reports.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {stats.reports.slice(0, 8).map((r: any) => (
                                    <div key={r.id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                r.status === 'approved' ? "bg-emerald-50 text-emerald-600" :
                                                    r.status === 'rejected' ? "bg-red-50 text-red-600" :
                                                        "bg-amber-50 text-amber-600"
                                            )}>
                                                {r.status === 'approved' ? <ArrowUpRight className="w-5 h-5" /> :
                                                    r.status === 'rejected' ? <ArrowDownRight className="w-5 h-5" /> :
                                                        <Calendar className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{r.vehicle_make} {r.vehicle_model}</p>
                                                <p className="text-xs text-slate-400 font-medium">VIN: ...{r.vehicle_vin?.slice(-6)} • {new Date(r.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase border-0",
                                            r.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                                                r.status === 'rejected' ? "bg-red-100 text-red-700" :
                                                    "bg-amber-100 text-amber-700"
                                        )}>
                                            {r.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-16 text-center">
                                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">No activity yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </FadeInView>
        </DashboardLayout>
    );
}
