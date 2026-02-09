'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import {
    FileText,
    CheckCircle2,
    Clock,
    Car,
    MoreHorizontal,
    ChevronDown,
    Camera,
    Flame,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FadeInView } from '@/lib/animations';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Stats {
    total: number;
    approved: number;
    pending: number;
    earnings: number;
}

interface Report {
    id: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_vin: string;
    status: string;
    created_at: string;
    images?: string[] | null;
}

export default function ContributorDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, earnings: 0 });
    const [recentReports, setRecentReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            // Fetch reports count
            const { data: reports } = await supabase
                .from('reports')
                .select('*')
                .eq('contributor_id', user.id)
                .order('created_at', { ascending: false });

            if (reports) {
                const approved = reports.filter(r => r.status === 'approved').length;
                const pending = reports.filter(r => r.status === 'pending').length;
                setStats({
                    total: reports.length,
                    approved,
                    pending,
                    earnings: approved * 2.50, // $2.50 per approved report
                });
                setRecentReports(reports.slice(0, 4));
            }

            setLoading(false);
        }
        fetchData();
    }, [user?.id]);

    const earningsGoal = 100;
    const progressPercent = Math.min((stats.earnings / earningsGoal) * 100, 100);

    const statCards = [
        {
            label: 'Total Submissions',
            value: stats.total,
        },
        {
            label: 'Approved',
            value: stats.approved,
        },
        {
            label: 'Pending Review',
            value: stats.pending,
        },
    ];

    const tips = [
        {
            icon: Camera,
            title: 'Photo Quality',
            desc: 'Take photos in daylight to increase your approval speed by 40%.',
            color: 'bg-purple-100 text-purple-600',
            containerColor: 'bg-transparent'
        },
        {
            icon: Car,
            title: 'VIN Number',
            desc: 'Always ensure the VIN plate is legible and matches the documentation.',
            color: 'bg-blue-100 text-blue-600',
            containerColor: 'bg-transparent'
        },
        {
            icon: Flame,
            title: 'Daily Streak',
            desc: 'Submit 2 more reports today to earn your 5-day streak bonus.',
            color: 'bg-orange-100 text-orange-600',
            containerColor: 'bg-transparent'
        },
    ];

    return (
        <DashboardLayout role={UserRole.CONTRIBUTOR}>
            <FadeInView delay={0.1} className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">Contributor Dashboard</h1>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, i) => (
                        <Card key={i} className="border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)] rounded-xl bg-white overflow-hidden">
                            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[160px]">
                                <p className="text-sm font-bold text-gray-500 mb-6 w-full text-left">{stat.label}</p>
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-5xl font-bold tracking-tighter">
                                        {loading ? '—' : stat.value}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Rewards Card */}
                    <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-xl overflow-hidden">
                        <CardContent className="p-6 flex flex-col h-full min-h-[160px]">
                            <p className="text-sm font-bold opacity-90 mb-2">Rewards Earned</p>
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-4xl font-bold tracking-tight">
                                    ${loading ? '—' : stats.earnings.toFixed(2)}
                                </p>
                            </div>
                            <div className="mt-4 space-y-1.5">
                                <div className="flex justify-between text-[11px] font-bold">
                                    <span className="opacity-80">Goal: ${earningsGoal}</span>
                                </div>
                                <Progress value={progressPercent} className="h-1.5 bg-white/30" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                    {/* Recent Submissions Table */}
                    <div className="lg:col-span-8 h-full">
                        <Card className="border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)] rounded-xl bg-white overflow-hidden h-full">
                            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-lg font-bold">Recent Submissions</CardTitle>
                                <Button variant="outline" size="sm" className="rounded-lg h-9 text-xs font-bold gap-1 border-gray-200">
                                    List View <ChevronDown className="w-3.5 h-3.5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-50 text-gray-400 text-xs font-bold bg-gray-50/30">
                                                <th className="px-6 py-4 text-left">Report</th>
                                                <th className="px-6 py-4 text-left">Status</th>
                                                <th className="px-6 py-4 text-left">Depth</th>
                                                <th className="px-6 py-4 text-left">Date</th>
                                                <th className="px-6 py-4 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {loading ? (
                                                Array(4).fill(0).map((_, i) => (
                                                    <tr key={i} className="animate-pulse">
                                                        <td colSpan={5} className="px-6 py-6 h-20 bg-muted/5"></td>
                                                    </tr>
                                                ))
                                            ) : recentReports.length > 0 ? (
                                                recentReports.map((report) => (
                                                    <tr key={report.id} className="group hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-gray-200/50">
                                                                    {report.images && report.images[0] ? (
                                                                        <img src={report.images[0]} alt="vehicle" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Car className="w-6 h-6 text-gray-400" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-bold text-gray-900 truncate">
                                                                        {report.vehicle_make} {report.vehicle_model}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 font-medium truncate shrink-0">
                                                                        {report.vehicle_vin}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge
                                                                className={cn(
                                                                    "rounded-lg font-bold px-3 py-1 border-none shadow-sm capitalize",
                                                                    report.status === 'approved'
                                                                        ? 'bg-blue-50 text-blue-600'
                                                                        : report.status === 'pending'
                                                                            ? 'bg-amber-50 text-amber-600'
                                                                            : 'bg-red-50 text-red-600'
                                                                )}
                                                            >
                                                                {report.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-gray-700">
                                                            ${report.status === 'approved' ? '2.50' : '0.00'}
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-gray-500 whitespace-nowrap">
                                                            {new Date(report.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-300 hover:text-gray-600">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium">
                                                        No submissions found. Start reporting now!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Verification Tips */}
                    <div className="lg:col-span-4 h-full">
                        <Card className="border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)] rounded-xl bg-white overflow-hidden h-full flex flex-col">
                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-lg font-bold">Verification Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-2 flex-1 flex flex-col justify-around">
                                {tips.map((tip, i) => (
                                    <div key={i} className="flex items-start gap-4 py-4 last:pb-0">
                                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm", tip.color.split(' ')[0])}>
                                            <tip.icon className={cn("w-5 h-5", tip.color.split(' ')[1])} />
                                        </div>
                                        <div className="space-y-1 pt-1">
                                            <p className="font-bold text-[15px] text-gray-900">{tip.title}</p>
                                            <p className="text-[13px] font-medium text-gray-400 leading-relaxed">
                                                {tip.desc}
                                            </p>
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
