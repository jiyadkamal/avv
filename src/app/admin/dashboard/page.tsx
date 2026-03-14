'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { 
    Users, FileText, CheckCircle2, Clock, 
    TrendingUp, ShieldCheck, ChevronRight, 
    Eye, Wrench, Zap, DollarSign, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ 
        totalReports: 0, 
        totalUsers: 0, 
        pendingReports: 0, 
        approvedReports: 0,
        pendingWorkshops: 0,
        activeWorkshops: 0,
        premiumUsers: 0
    });
    const [pendingItems, setPendingItems] = useState<any[]>([]);
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
                const workshopRequests = workshopData.requests || [];

                const pending = reports.filter((r: any) => r.status === 'pending');
                const approved = reports.filter((r: any) => r.status === 'approved');
                const activeWorkshops = users.filter((u: any) => u.is_workshop).length;
                const premiumUsers = users.filter((u: any) => u.account_tier === 'premium').length;

                setStats({ 
                    totalReports: reports.length, 
                    totalUsers: users.length, 
                    pendingReports: pending.length, 
                    approvedReports: approved.length,
                    pendingWorkshops: workshopRequests.length,
                    activeWorkshops: activeWorkshops,
                    premiumUsers: premiumUsers
                });

                // Mix pending reports and workshop requests for "Needs Attention"
                const mixedPending = [
                    ...workshopRequests.map((wr: any) => ({ ...wr, type: 'workshop_request' })),
                    ...pending.slice(0, 5).map((r: any) => ({ ...r, type: 'report' }))
                ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                setPendingItems(mixedPending.slice(0, 6));
            } catch (e) { 
                console.error(e); 
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    const handleReportAction = async (id: string, action: 'approved' | 'rejected') => {
        try { 
            const res = await fetch(`/api/reports/${id}`, { 
                method: 'PATCH', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ status: action }) 
            }); 
            if (res.ok) { 
                toast.success(`Report ${action}`); 
                setPendingItems(prev => prev.filter(item => item.id !== id));
                setStats(prev => ({ 
                    ...prev, 
                    pendingReports: prev.pendingReports - 1, 
                    ...(action === 'approved' ? { approvedReports: prev.approvedReports + 1 } : {}) 
                })); 
            } 
        } catch { 
            toast.error('Failed to update report'); 
        }
    };

    const statCards = [
        { label: 'Platform Users', value: stats.totalUsers, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', trend: '+12%' },
        { label: 'Active Workshops', value: stats.activeWorkshops, icon: Wrench, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+8%' },
        { label: 'Vehicle Reports', value: stats.totalReports, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+24%' },
        { label: 'Pending Reviews', value: stats.pendingReports + stats.pendingWorkshops, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: null },
    ];

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-10 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Platform Overview</h1>
                        <p className="text-slate-500 font-medium">Monitoring system activity and moderation throughput.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg px-4 py-2 font-bold text-xs uppercase tracking-widest shadow-sm">
                            <Activity className="w-4 h-4 mr-2 animate-pulse" /> Live Monitoring
                        </Badge>
                    </div>
                </div>

                {/* Growth Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, i) => (
                        <FadeInView key={stat.label} delay={0.1 + i * 0.05}>
                            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100 group hover:shadow-md transition-all">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                                            <stat.icon className="w-7 h-7" />
                                        </div>
                                        {stat.trend && (
                                            <Badge className="rounded-lg px-2.5 py-1 text-[10px] font-black tracking-widest text-emerald-700 bg-emerald-50 border-0 uppercase">
                                                {stat.trend}
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{loading ? '—' : stat.value.toLocaleString()}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                </CardContent>
                            </Card>
                        </FadeInView>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Moderation Queue Preview */}
                    <Card className="lg:col-span-2 border-none shadow-sm rounded-[40px] overflow-hidden bg-white border border-slate-100">
                        <CardHeader className="flex flex-row items-center justify-between px-10 py-8 border-b border-slate-50">
                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-indigo-600" /> Moderation Priority
                            </CardTitle>
                            <Link href="/admin/moderation">
                                <Button variant="ghost" size="sm" className="rounded-xl text-indigo-600 font-bold text-xs uppercase tracking-widest gap-2 hover:bg-indigo-50">
                                    Queue Hub <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-10 space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)}
                                </div>
                            ) : pendingItems.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {pendingItems.map((item: any) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-10 hover:bg-slate-50/50 transition-all gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                                    item.type === 'report' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                                )}>
                                                    {item.type === 'report' ? <FileText className="w-7 h-7" /> : <Wrench className="w-7 h-7" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <p className="text-lg font-bold text-slate-900">
                                                            {item.type === 'report' ? `${item.vehicle_make} ${item.vehicle_model}` : item.workshop_name}
                                                        </p>
                                                        <Badge className={cn(
                                                            "rounded-md px-1.5 py-0 text-[10px] font-black uppercase border-0",
                                                            item.type === 'report' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                                        )}>
                                                            {item.type === 'report' ? 'Report' : 'Workshop'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs font-medium text-slate-400">
                                                        {item.type === 'report' ? `VIN: ...${item.vehicle_vin?.slice(-8)}` : `GST: ${item.gst_number}`} • {new Date(item.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 md:ml-auto">
                                                <Link href={item.type === 'report' ? `/admin/moderation` : `/admin/moderation?tab=workshops`}>
                                                    <Button size="icon" variant="outline" className="rounded-xl h-12 w-12 border-slate-100 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all"><Eye className="w-5 h-5" /></Button>
                                                </Link>
                                                {item.type === 'report' && (
                                                    <>
                                                        <Button 
                                                            variant="outline" 
                                                            className="rounded-xl h-12 px-6 border-red-100 text-red-600 hover:bg-red-50 font-bold text-xs uppercase tracking-widest"
                                                            onClick={() => handleReportAction(item.id, 'rejected')}
                                                        >
                                                            Reject
                                                        </Button>
                                                        <Button 
                                                            className="rounded-xl h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
                                                            onClick={() => handleReportAction(item.id, 'approved')}
                                                        >
                                                            Approve
                                                        </Button>
                                                    </>
                                                )}
                                                {item.type === 'workshop_request' && (
                                                    <Link href="/admin/moderation?tab=workshops">
                                                        <Button className="rounded-xl h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100">
                                                            Verify Workshop
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 px-10">
                                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Queue is Clear</h3>
                                    <p className="text-slate-500 font-medium">All vehicle reports and workshop applications have been reviewed.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats Panel */}
                    <div className="space-y-8">
                        <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white border border-slate-100">
                            <CardContent className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-indigo-50 text-indigo-600 border-0 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest uppercase">Account Overview</Badge>
                                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Users</p>
                                    <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900">{loading ? '—' : stats.totalUsers}</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Premium</p>
                                        <p className="text-lg font-bold text-slate-900">{loading ? '—' : `${stats.premiumUsers} Users`}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workshops</p>
                                        <p className="text-lg font-bold text-slate-900">{loading ? '—' : `${stats.activeWorkshops} Active`}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white border border-slate-100">
                            <CardHeader className="p-10 pb-6">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-amber-500" /> System Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-10 pb-10 space-y-6">
                                {[
                                    { label: 'Avg Response Time', value: '420ms', color: 'bg-emerald-500' },
                                    { label: 'Uptime (30d)', value: '99.98%', color: 'bg-indigo-500' },
                                    { label: 'Error Rate', value: '0.04%', color: 'bg-emerald-500' },
                                ].map(metric => (
                                    <div key={metric.label} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                            <span className="text-slate-400">{metric.label}</span>
                                            <span className="text-slate-900">{metric.value}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full animate-grow-x", metric.color)} style={{ width: '85%' }} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </FadeInView>
        </DashboardLayout>
    );
}
