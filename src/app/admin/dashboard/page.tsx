'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import {
    Users,
    FileText,
    CheckCircle2,
    Clock,
    TrendingUp,
    ShieldCheck,
    ChevronRight,
    Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Stats {
    totalReports: number;
    totalUsers: number;
    pendingReports: number;
    approvedReports: number;
}

interface Report {
    id: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_vin: string;
    status: string;
    created_at: string;
    profiles?: { full_name: string };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalReports: 0,
        totalUsers: 0,
        pendingReports: 0,
        approvedReports: 0
    });
    const [pendingReports, setPendingReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            // Fetch reports
            const { data: reports } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            // Fetch users
            const { data: users } = await supabase
                .from('profiles')
                .select('id');

            if (reports) {
                const pending = reports.filter(r => r.status === 'pending');
                const approved = reports.filter(r => r.status === 'approved');
                setStats({
                    totalReports: reports.length,
                    totalUsers: users?.length || 0,
                    pendingReports: pending.length,
                    approvedReports: approved.length,
                });
                setPendingReports(pending.slice(0, 5));
            }

            setLoading(false);
        }
        fetchData();
    }, []);

    const handleApprove = async (id: string) => {
        const { error } = await supabase
            .from('reports')
            .update({ status: 'approved' })
            .eq('id', id);

        if (!error) {
            toast.success('Report approved');
            setPendingReports(prev => prev.filter(r => r.id !== id));
            setStats(prev => ({
                ...prev,
                pendingReports: prev.pendingReports - 1,
                approvedReports: prev.approvedReports + 1,
            }));
        }
    };

    const handleReject = async (id: string) => {
        const { error } = await supabase
            .from('reports')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (!error) {
            toast.success('Report rejected');
            setPendingReports(prev => prev.filter(r => r.id !== id));
            setStats(prev => ({
                ...prev,
                pendingReports: prev.pendingReports - 1,
            }));
        }
    };

    const statCards = [
        {
            label: 'Total Reports',
            value: stats.totalReports,
            icon: FileText,
            color: 'bg-blue-500/10 text-blue-600',
            trend: '+24%'
        },
        {
            label: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'bg-purple-500/10 text-purple-600',
            trend: '+12%'
        },
        {
            label: 'Pending Review',
            value: stats.pendingReports,
            icon: Clock,
            color: 'bg-amber-500/10 text-amber-600',
            trend: null
        },
        {
            label: 'Approved',
            value: stats.approvedReports,
            icon: CheckCircle2,
            color: 'bg-emerald-500/10 text-emerald-600',
            trend: '+18%'
        },
    ];

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            Monitor platform activity and manage verifications.
                        </p>
                    </div>
                    <Link href="/admin/moderation" className="w-full md:w-auto">
                        <Button className="rounded-2xl h-12 px-6 font-bold gap-2 w-full">
                            <ShieldCheck className="w-4 h-4" />
                            Review Queue
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, i) => (
                        <FadeInView key={stat.label} delay={0.1 + i * 0.05}>
                            <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn("p-3 rounded-xl", stat.color)}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        {stat.trend && (
                                            <Badge variant="secondary" className="rounded-full text-xs font-bold text-emerald-600 bg-emerald-50">
                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                {stat.trend}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-3xl font-bold mb-1">
                                        {loading ? '—' : stat.value.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                </CardContent>
                            </Card>
                        </FadeInView>
                    ))}
                </div>

                {/* Pending Reports */}
                <Card className="border-none shadow-sm rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
                        <CardTitle className="text-lg font-bold">Pending Verification Queue</CardTitle>
                        <Link href="/admin/moderation">
                            <Button variant="ghost" size="sm" className="rounded-xl text-primary font-semibold gap-1">
                                View All
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-muted/30 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : pendingReports.length > 0 ? (
                            <div className="space-y-3">
                                {pendingReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                                <Clock className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold truncate">
                                                    {report.vehicle_make} {report.vehicle_model}
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    VIN: ...{report.vehicle_vin?.slice(-6) || 'N/A'} • {new Date(report.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:ml-auto">
                                            <Link href={`/admin/moderation/${report.id}`} className="flex-1 sm:flex-none">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-xl w-full sm:w-auto"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-xl text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
                                                onClick={() => handleReject(report.id)}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="rounded-xl flex-1 sm:flex-none"
                                                onClick={() => handleApprove(report.id)}
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500/30 mx-auto mb-4" />
                                <p className="text-xl font-bold mb-1">All Caught Up!</p>
                                <p className="text-muted-foreground">No pending reports to review.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </FadeInView>
        </DashboardLayout>
    );
}
