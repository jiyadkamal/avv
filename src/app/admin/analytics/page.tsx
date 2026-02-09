'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { BarChart3, TrendingUp, Users, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FadeInView } from '@/lib/animations';
import { supabase } from '@/lib/supabase/client';

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        totalReports: 0,
        totalUsers: 0,
        approvedReports: 0,
        pendingReports: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            const [reportsRes, usersRes] = await Promise.all([
                supabase.from('reports').select('status', { count: 'exact' }),
                supabase.from('profiles').select('id', { count: 'exact' })
            ]);

            const reports = reportsRes.data || [];
            const approved = reports.filter(r => r.status === 'approved').length;
            const pending = reports.filter(r => r.status === 'pending').length;

            setStats({
                totalReports: reportsRes.count || 0,
                totalUsers: usersRes.count || 0,
                approvedReports: approved,
                pendingReports: pending
            });
            setLoading(false);
        }
        fetchStats();
    }, []);

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Analytics</h1>
                    <p className="text-muted-foreground">Platform performance and insights.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <FileText className="w-7 h-7 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Reports</p>
                                <p className="text-3xl font-bold">{loading ? '...' : stats.totalReports}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                <Users className="w-7 h-7 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                                <p className="text-3xl font-bold">{loading ? '...' : stats.totalUsers}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Approved</p>
                                <p className="text-3xl font-bold">{loading ? '...' : stats.approvedReports}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Pending</p>
                                <p className="text-3xl font-bold">{loading ? '...' : stats.pendingReports}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Placeholder */}
                <Card className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle>Reports Over Time</CardTitle>
                        <CardDescription>Monthly submission trends</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <div className="h-64 bg-muted/20 rounded-2xl flex items-center justify-center">
                            <div className="text-center">
                                <BarChart3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground">Charts will be available with more data.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </FadeInView>
        </DashboardLayout>
    );
}
