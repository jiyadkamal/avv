'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { FileText, CheckCircle2, XCircle, Clock, ChevronRight, Loader2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ContributorReportsPage() {
    const { user } = useAuthStore();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReports() {
            if (!user?.id) { setLoading(false); return; }
            try { const res = await fetch(`/api/reports?contributor_id=${user.id}`); const data = await res.json(); setReports(data.reports || []); }
            catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchReports();
    }, [user?.id]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-emerald-50 text-emerald-700 border-0 rounded-full font-medium text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected': return <Badge className="bg-red-50 text-red-700 border-0 rounded-full font-medium text-xs"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default: return <Badge className="bg-amber-50 text-amber-700 border-0 rounded-full font-medium text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        }
    };

    return (
        <DashboardLayout role={UserRole.CONTRIBUTOR}>
            <FadeInView delay={0.1} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">My Reports</h1>
                        <p className="text-slate-500 text-sm">All your submitted accident reports.</p>
                    </div>
                    <Link href="/contributor/upload">
                        <Button className="rounded-lg h-10 px-5 font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
                            <Plus className="w-4 h-4" />New Report
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
                ) : reports.length > 0 ? (
                    <div className="space-y-3">
                        {reports.map((r: any, i: number) => (
                            <FadeInView key={r.id} delay={0.05 + i * 0.03}>
                                <Link href={`/contributor/reports/${r.id}`}>
                                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                                        r.status === 'approved' ? "bg-emerald-50 text-emerald-600" :
                                                            r.status === 'rejected' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                                                    )}>
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-900 truncate">{r.vehicle_make} {r.vehicle_model}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">VIN: ...{r.vehicle_vin?.slice(-8) || 'N/A'} • {new Date(r.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    {getStatusBadge(r.status)}
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </FadeInView>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-white border-slate-200 rounded-xl border-dashed">
                        <CardContent className="p-16 text-center">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">No reports yet</h3>
                            <p className="text-slate-500 text-sm mb-6">Submit your first accident report to get started.</p>
                            <Link href="/contributor/upload"><Button className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold gap-2"><Plus className="w-4 h-4" />New Report</Button></Link>
                        </CardContent>
                    </Card>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
