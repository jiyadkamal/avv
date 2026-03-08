'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { Users, FileText, CheckCircle2, Clock, TrendingUp, ShieldCheck, ChevronRight, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalReports: 0, totalUsers: 0, pendingReports: 0, approvedReports: 0 });
    const [pendingReports, setPendingReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [reportsRes, usersRes] = await Promise.all([fetch('/api/reports'), fetch('/api/users')]);
                const reportsData = await reportsRes.json();
                const usersData = await usersRes.json();
                const reports = reportsData.reports || [];
                const users = usersData.users || [];
                const pending = reports.filter((r: any) => r.status === 'pending');
                const approved = reports.filter((r: any) => r.status === 'approved');
                setStats({ totalReports: reports.length, totalUsers: users.length, pendingReports: pending.length, approvedReports: approved.length });
                setPendingReports(pending.slice(0, 5));
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchData();
    }, []);

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        try { const res = await fetch(`/api/reports/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: action }) }); if (res.ok) { toast.success(`Report ${action}`); setPendingReports(prev => prev.filter(r => r.id !== id)); setStats(prev => ({ ...prev, pendingReports: prev.pendingReports - 1, ...(action === 'approved' ? { approvedReports: prev.approvedReports + 1 } : {}) })); } } catch { toast.error('Failed'); }
    };

    const statCards = [
        { label: 'Total Reports', value: stats.totalReports, icon: FileText, color: 'bg-indigo-50 text-indigo-600', trend: '+24%' },
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-violet-50 text-violet-600', trend: '+12%' },
        { label: 'Pending Review', value: stats.pendingReports, icon: Clock, color: 'bg-amber-50 text-amber-600', trend: null },
        { label: 'Approved', value: stats.approvedReports, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', trend: '+18%' },
    ];

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Admin Dashboard</h1>
                        <p className="text-slate-500 text-sm">Overview of platform activity and moderation queue.</p>
                    </div>
                    <Link href="/admin/moderation">
                        <Button className="rounded-lg h-10 px-5 font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
                            <ShieldCheck className="w-4 h-4" />Review Reports
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statCards.map((stat, i) => (
                        <FadeInView key={stat.label} delay={0.1 + i * 0.05}>
                            <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color)}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        {stat.trend && (
                                            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border-0">
                                                <TrendingUp className="w-3 h-3 mr-1" />{stat.trend}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{loading ? '—' : stat.value.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
                                </CardContent>
                            </Card>
                        </FadeInView>
                    ))}
                </div>

                <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between px-6 py-5 pb-3">
                        <CardTitle className="text-lg font-semibold text-slate-900">Pending Reviews</CardTitle>
                        <Link href="/admin/moderation">
                            <Button variant="ghost" size="sm" className="rounded-lg text-indigo-600 font-medium text-sm gap-1 hover:bg-indigo-50">
                                View All <ChevronRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />)}</div>
                            : pendingReports.length > 0 ? (
                                <div className="space-y-3">
                                    {pendingReports.map((r: any) => (
                                        <div key={r.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                                    <Clock className="w-5 h-5 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{r.vehicle_make} {r.vehicle_model}</p>
                                                    <p className="text-xs text-slate-500">VIN: ...{r.vehicle_vin?.slice(-6) || 'N/A'} • {new Date(r.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 md:ml-auto">
                                                <Link href={`/admin/moderation/${r.id}`}>
                                                    <Button size="sm" variant="outline" className="rounded-lg h-9 border-slate-200 text-slate-600 hover:bg-slate-100"><Eye className="w-4 h-4" /></Button>
                                                </Link>
                                                <Button size="sm" variant="outline" className="rounded-lg h-9 border-red-200 text-red-600 hover:bg-red-50 font-medium text-xs" onClick={() => handleAction(r.id, 'rejected')}>Reject</Button>
                                                <Button size="sm" className="rounded-lg h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4" onClick={() => handleAction(r.id, 'approved')}>Approve</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <p className="font-semibold text-slate-900 mb-1">All caught up!</p>
                                    <p className="text-slate-500 text-sm">No pending reports to review.</p>
                                </div>
                            )
                        }
                    </CardContent>
                </Card>
            </FadeInView>
        </DashboardLayout>
    );
}
