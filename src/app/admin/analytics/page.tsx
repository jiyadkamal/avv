'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { FileText, Users, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FadeInView } from '@/lib/animations';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
    const [stats, setStats] = useState({ totalReports: 0, totalUsers: 0, approvedReports: 0, pendingReports: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [reportsRes, usersRes] = await Promise.all([fetch('/api/reports'), fetch('/api/users')]);
                const reportsData = await reportsRes.json();
                const usersData = await usersRes.json();
                const reports = reportsData.reports || [];
                const users = usersData.users || [];
                setStats({ totalReports: reports.length, totalUsers: users.length, approvedReports: reports.filter((r: any) => r.status === 'approved').length, pendingReports: reports.filter((r: any) => r.status === 'pending').length });
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchData();
    }, []);

    const statCards = [
        { label: 'Total Reports', value: stats.totalReports, icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-violet-50 text-violet-600' },
        { label: 'Approved', value: stats.approvedReports, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Pending', value: stats.pendingReports, icon: Calendar, color: 'bg-amber-50 text-amber-600' }
    ];

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Analytics</h1>
                    <p className="text-slate-500 text-sm">Platform performance and growth metrics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statCards.map((card, i) => (
                        <FadeInView key={card.label} delay={0.1 + i * 0.05}>
                            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", card.color)}>
                                            <card.icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{loading ? '—' : card.value.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{card.label}</p>
                                </CardContent>
                            </Card>
                        </FadeInView>
                    ))}
                </div>

                <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                    <CardHeader className="px-6 py-5">
                        <CardTitle className="text-lg font-semibold text-slate-900">Report Trends</CardTitle>
                        <CardDescription className="text-slate-500 text-sm">Historical data visualization</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <div className="h-[300px] bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <BarChart3 className="w-7 h-7 text-slate-400" />
                            </div>
                            <h4 className="font-semibold text-slate-900 mb-1">Chart Coming Soon</h4>
                            <p className="text-slate-500 text-sm max-w-sm">Visualizations will appear here once more data has been collected.</p>
                        </div>
                    </CardContent>
                </Card>
            </FadeInView>
        </DashboardLayout>
    );
}
