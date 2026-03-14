'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole, AccountTier, WorkshopStatus } from '@/types';
import { 
    Search, BookmarkCheck, Car, ChevronRight, Clock, FileText, 
    Loader2, DollarSign, CheckCircle2, TrendingUp, Plus, ShieldCheck, 
    Zap, Wrench, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function UserDashboard() {
    const { user, setUser } = useAuthStore();
    const [stats, setStats] = useState({ 
        totalReports: 0, 
        pendingReports: 0, 
        approvedReports: 0, 
        totalEarnings: 0,
        savedCount: 0 
    });
    const [recentReports, setRecentReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user?.id) { setLoading(false); return; }
            
            // Re-fetch fresh profile from /api/auth/me to sync admin approvals (workshop, etc.)
            try {
                const meRes = await fetch('/api/auth/me');
                if (meRes.ok) {
                    const meData = await meRes.json();
                    if (meData.user) {
                        setUser(meData.user);
                    }
                }
            } catch (e) { console.error('Auth sync failed:', e); }

            try {
                const [reportsRes, earningsRes, savedRes] = await Promise.all([
                    fetch(`/api/reports?contributor_id=${user.id}`),
                    fetch('/api/earnings'),
                    fetch('/api/saved-reports')
                ]);
                
                const reportsData = await reportsRes.json();
                const earningsData = await earningsRes.json();
                const savedData = await savedRes.json();
                
                const reports = reportsData.reports || [];
                const earnings = earningsData.earnings || [];
                const saved = savedData.savedReports || [];
                
                const pending = reports.filter((r: any) => r.status === 'pending');
                const approved = reports.filter((r: any) => r.status === 'approved');
                const totalEarnings = earnings.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
                
                setStats({ 
                    totalReports: reports.length, 
                    pendingReports: pending.length, 
                    approvedReports: approved.length, 
                    totalEarnings,
                    savedCount: saved.length
                });
                setRecentReports(reports.slice(0, 5));
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchData();
    }, [user?.id]);

    const statCards = [
        { label: 'My Reports', value: stats.totalReports, icon: FileText, color: 'bg-indigo-50 text-indigo-600', href: '/user/reports' },
        { label: 'Earnings', value: `$${stats.totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', href: '/user/wallet' },
        { label: 'Saved', value: stats.savedCount, icon: BookmarkCheck, color: 'bg-purple-50 text-purple-600', href: '/user/saved' },
    ];

    if (!user) return null;

    return (
        <DashboardLayout role={UserRole.USER}>
            <FadeInView delay={0.1} className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            Welcome back, {user.full_name?.split(' ')[0]}
                        </h1>
                        <div className="flex flex-wrap gap-2 items-center">
                            <Badge className={cn(
                                "rounded-lg px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider",
                                user.account_tier === AccountTier.FREE ? "bg-slate-100 text-slate-600" :
                                user.account_tier === AccountTier.PREMIUM ? "bg-indigo-100 text-indigo-700" :
                                "bg-amber-100 text-amber-700"
                            )}>
                                {user.account_tier === AccountTier.FREE && <Zap className="w-3 h-3 mr-1 inline" />}
                                {user.account_tier} TIER
                            </Badge>
                            {user.is_workshop && (
                                <Badge className="bg-emerald-100 text-emerald-700 rounded-lg px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Wrench className="w-3 h-3" /> Workshop Account
                                </Badge>
                            )}
                            {!user.is_workshop && user.workshop_status === WorkshopStatus.PENDING && (
                                <Badge className="bg-blue-100 text-blue-700 rounded-lg px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                                    Workshop: Pending Approval
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {user.account_tier === AccountTier.FREE && (
                            <Link href="/user/upgrade">
                                <Button variant="outline" className="rounded-xl font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                    Upgrade to Pro
                                </Button>
                            </Link>
                        )}
                        <Link href="/user/upload">
                            <Button className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                                <Plus className="w-4 h-4" /> New Report
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Account Status / Prompt Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-none shadow-sm bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-3xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck className="w-32 h-32" />
                        </div>
                        <CardContent className="p-8 relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">Search Vehicle History</h1>
                                <p className="text-indigo-100 mb-6 max-w-md">
                                    Access comprehensive history reports, including accident severity, service records, and verification status.
                                </p>
                            </div>
                            <div>
                                {user.account_tier === AccountTier.FREE ? (
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-indigo-200" />
                                            <p className="text-sm font-medium">Search is locked for Free accounts</p>
                                        </div>
                                        <Link href="/user/upgrade">
                                            <Button size="sm" className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold">
                                                Unlock Now
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <Link href="/user/search">
                                        <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl font-extrabold px-8">
                                            <Search className="w-5 h-5 mr-2" /> Start Searching
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl bg-slate-50 border border-slate-200">
                        <CardContent className="p-6 flex flex-col justify-between h-full">
                            <div>
                                <div className="p-3 bg-white rounded-2xl w-fit mb-4 shadow-sm border border-slate-100">
                                    <Wrench className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-bold mb-2">Workshop Account</h2>
                                <p className="text-sm text-slate-500 mb-6">
                                    Get $10 per approved report and more features for your business.
                                </p>
                            </div>
                            <div>
                                {user.is_workshop ? (
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                        <CheckCircle2 className="w-5 h-5" /> Workshop Active
                                    </div>
                                ) : user.workshop_status === WorkshopStatus.PENDING ? (
                                    <div className="text-blue-600 font-bold bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                                        <span>Verification Pending</span>
                                        <Clock className="w-4 h-4" />
                                    </div>
                                ) : (
                                    <Link href="/user/workshop-apply">
                                        <Button className="w-full rounded-2xl bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 font-bold h-12">
                                            Apply for Workshop
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statCards.map((stat, i) => (
                        <FadeInView key={stat.label} delay={0.2 + i * 0.05}>
                            <Link href={stat.href}>
                                <Card className="border-none shadow-sm rounded-2xl hover:shadow-md transition-shadow cursor-pointer border border-slate-100">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("p-3 rounded-2xl", stat.color)}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                                <p className="text-2xl font-bold text-slate-900">
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300" />
                                    </CardContent>
                                </Card>
                            </Link>
                        </FadeInView>
                    ))}
                </div>

                {/* Recent Activity */}
                <Card className="border-none shadow-sm rounded-3xl p-2 border border-slate-100">
                    <CardHeader className="p-6 pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold">My Recent Reports</CardTitle>
                            <Link href="/user/reports">
                                <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl">
                                    View All
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : recentReports.length > 0 ? (
                            <div className="space-y-3">
                                {recentReports.map(report => (
                                    <Link key={report.id} href={`/user/reports/${report.id}`}>
                                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                                    report.status === 'approved' ? "bg-emerald-100 text-emerald-600" :
                                                    report.status === 'rejected' ? "bg-red-100 text-red-600" :
                                                    "bg-amber-100 text-amber-600"
                                                )}>
                                                    <Car className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{report.vehicle_make} {report.vehicle_model}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(report.created_at).toLocaleDateString()} • VIN: ...{report.vehicle_vin?.slice(-6)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={cn(
                                                "rounded-full px-3 py-1 font-bold text-[10px] uppercase border-0",
                                                report.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                                                report.status === 'rejected' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                            )}>
                                                {report.status}
                                            </Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="font-bold text-slate-900 mb-1">No reports yet</p>
                                <p className="text-sm text-slate-500 mb-6">Submit your first report to start earning rewards.</p>
                                <Link href="/user/upload">
                                    <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
                                        <Plus className="w-4 h-4" /> Submit Report
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
