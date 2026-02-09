'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { ShieldCheck, CheckCircle, XCircle, Clock, FileText, Calendar, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeInView } from '@/lib/animations';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Report {
    id: string;
    contributor_id: string;
    vehicle_vin: string;
    vehicle_plate: string;
    vehicle_make: string;
    vehicle_model: string;
    description: string;
    severity: string;
    status: string;
    images: string[];
    created_at: string;
    profiles?: { full_name: string; email: string };
}

type StatusFilter = 'pending' | 'approved' | 'rejected';

export default function ModerationPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('pending');

    useEffect(() => {
        fetchReports(activeFilter);
    }, [activeFilter]);

    async function fetchReports(status: StatusFilter) {
        setLoading(true);
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
        }

        if (data) {
            const reportsWithProfiles = await Promise.all(
                data.map(async (report) => {
                    if (report.contributor_id) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('full_name, email')
                            .eq('id', report.contributor_id)
                            .single();
                        return { ...report, profiles: profile };
                    }
                    return report;
                })
            );
            setReports(reportsWithProfiles);
        }
        setLoading(false);
    }

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        const { error } = await supabase
            .from('reports')
            .update({ status: 'approved', verified_at: new Date().toISOString() })
            .eq('id', id);

        if (!error) {
            const report = reports.find(r => r.id === id);
            if (report) {
                await supabase.from('earnings').insert({
                    profile_id: report.contributor_id,
                    amount: 5.00,
                    status: 'pending',
                    report_id: id,
                    created_at: new Date().toISOString(),
                });
            }
            setReports(prev => prev.filter(r => r.id !== id));
            toast.success("Report approved!");
        } else {
            toast.error("Failed to approve report");
        }
        setProcessingId(null);
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        const { error } = await supabase
            .from('reports')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (!error) {
            setReports(prev => prev.filter(r => r.id !== id));
            toast.success("Report rejected");
        } else {
            toast.error("Failed to reject report");
        }
        setProcessingId(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-full px-4 py-1"><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-rose-50 text-rose-600 border-rose-100 rounded-full px-4 py-1"><XCircle className="w-3.5 h-3.5 mr-1.5" /> Rejected</Badge>;
            default:
                return <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-full px-4 py-1"><Clock className="w-3.5 h-3.5 mr-1.5" /> Pending</Badge>;
        }
    };

    const tabs: { label: string; value: StatusFilter; icon: React.ReactNode }[] = [
        { label: 'Pending', value: 'pending', icon: <Clock className="w-4 h-4" /> },
        { label: 'Approved', value: 'approved', icon: <CheckCircle className="w-4 h-4" /> },
        { label: 'Rejected', value: 'rejected', icon: <XCircle className="w-4 h-4" /> },
    ];

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Moderation Queue</h1>
                    <p className="text-muted-foreground">Review and verify submitted accident reports.</p>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveFilter(tab.value)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                                activeFilter === tab.value
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="border-none shadow-lg rounded-2xl animate-pulse">
                                <CardContent className="p-6 h-32 bg-muted/20" />
                            </Card>
                        ))}
                    </div>
                ) : reports.length > 0 ? (
                    <div className="space-y-6">
                        {reports.map((report) => (
                            <Card key={report.id} className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
                                <CardHeader className="p-6 pb-4 border-b flex flex-row items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center",
                                            activeFilter === 'pending' && "bg-yellow-500/10",
                                            activeFilter === 'approved' && "bg-emerald-500/10",
                                            activeFilter === 'rejected' && "bg-rose-500/10"
                                        )}>
                                            <FileText className={cn(
                                                "w-7 h-7",
                                                activeFilter === 'pending' && "text-yellow-500",
                                                activeFilter === 'approved' && "text-emerald-500",
                                                activeFilter === 'rejected' && "text-rose-500"
                                            )} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{report.vehicle_make} {report.vehicle_model}</CardTitle>
                                            <p className="text-sm text-muted-foreground">VIN: {report.vehicle_vin || 'N/A'}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Submitted by: {report.profiles?.full_name || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(report.status)}
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {report.description && (
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Description</p>
                                            <p className="text-sm">{report.description}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </div>
                                        {report.severity && (
                                            <Badge variant="outline" className="rounded-full">{report.severity}</Badge>
                                        )}
                                    </div>

                                    {report.images && report.images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2 pt-2">
                                            {report.images.slice(0, 4).map((img, i) => (
                                                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted">
                                                    <img src={img} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 pt-4 border-t">
                                        {activeFilter === 'pending' && (
                                            <>
                                                <Button
                                                    className="rounded-xl h-11 px-6 font-bold bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleApprove(report.id)}
                                                    disabled={processingId === report.id}
                                                >
                                                    {processingId === report.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                    )}
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="rounded-xl h-11 px-6 font-bold text-red-600 hover:bg-red-50 border-red-200"
                                                    onClick={() => handleReject(report.id)}
                                                    disabled={processingId === report.id}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        <Link href={`/admin/moderation/${report.id}`} className="ml-auto">
                                            <Button variant="ghost" className="rounded-xl h-11 px-5 font-bold text-primary gap-1">
                                                View Details
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-none shadow-lg rounded-2xl">
                        <CardContent className="p-12 text-center">
                            <ShieldCheck className="w-16 h-16 text-green-500/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">
                                {activeFilter === 'pending' ? 'All Caught Up!' : `No ${activeFilter} reports`}
                            </h3>
                            <p className="text-muted-foreground">
                                {activeFilter === 'pending'
                                    ? 'No pending reports to review.'
                                    : `There are no ${activeFilter} reports in the system.`}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
