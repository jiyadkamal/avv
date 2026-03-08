'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { ShieldCheck, CheckCircle, XCircle, Clock, FileText, Calendar, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeInView } from '@/lib/animations';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type StatusFilter = 'pending' | 'approved' | 'rejected';

export default function ModerationPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('pending');

    useEffect(() => { fetchReports(activeFilter); }, [activeFilter]);

    async function fetchReports(status: StatusFilter) {
        setLoading(true);
        try { const res = await fetch(`/api/reports?status=${status}`); const data = await res.json(); setReports(data.reports || []); }
        catch (e) { console.error(e); toast.error('Failed to load reports'); }
        setLoading(false);
    }

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        setProcessingId(id);
        try { const res = await fetch(`/api/reports/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: action }) }); if (res.ok) { setReports(prev => prev.filter(r => r.id !== id)); toast.success(`Report ${action}!`); } else toast.error('Failed'); }
        catch { toast.error('Failed'); }
        setProcessingId(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full font-medium text-xs"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected': return <Badge className="bg-red-50 text-red-700 border-red-200 rounded-full font-medium text-xs"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default: return <Badge className="bg-amber-50 text-amber-700 border-amber-200 rounded-full font-medium text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        }
    };

    const tabs: { label: string; value: StatusFilter; icon: React.ReactNode }[] = [
        { label: 'Pending', value: 'pending', icon: <Clock className="w-4 h-4" /> },
        { label: 'Approved', value: 'approved', icon: <CheckCircle className="w-4 h-4" /> },
        { label: 'Rejected', value: 'rejected', icon: <XCircle className="w-4 h-4" /> },
    ];

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Moderation Queue</h1>
                    <p className="text-slate-500 text-sm">Review and moderate submitted accident reports.</p>
                </div>

                <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
                    {tabs.map(tab => (
                        <button key={tab.value} onClick={() => setActiveFilter(tab.value)} className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeFilter === tab.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}>
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                ) : reports.length > 0 ? (
                    <div className="space-y-4">
                        {reports.map((r: any) => (
                            <Card key={r.id} className="bg-white border-slate-200 shadow-sm rounded-xl hover:border-slate-300 transition-all">
                                <CardHeader className="p-6 pb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center",
                                                activeFilter === 'pending' ? "bg-amber-50 text-amber-600" :
                                                    activeFilter === 'approved' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                            )}>
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-slate-900">{r.vehicle_make} {r.vehicle_model}</CardTitle>
                                                <p className="text-xs text-slate-500 mt-0.5">VIN: {r.vehicle_vin || 'N/A'}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(r.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 pt-3 space-y-4">
                                    {r.description && (
                                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                            <p className="text-sm text-slate-600 leading-relaxed">{r.description}</p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-6 text-xs text-slate-500">
                                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(r.created_at).toLocaleDateString()}</div>
                                        {r.severity && <Badge variant="outline" className="rounded-full text-xs border-slate-200">{r.severity}</Badge>}
                                    </div>
                                    {r.images?.length > 0 && (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                            {r.images.slice(0, 4).map((img: string, i: number) => (
                                                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                                                    <img src={img} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100">
                                        {activeFilter === 'pending' && (
                                            <div className="flex gap-2 flex-1">
                                                <Button className="flex-1 rounded-lg h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm" onClick={() => handleAction(r.id, 'approved')} disabled={processingId === r.id}>
                                                    {processingId === r.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}Approve
                                                </Button>
                                                <Button variant="outline" className="flex-1 rounded-lg h-10 text-red-600 hover:bg-red-50 border-red-200 font-medium text-sm" onClick={() => handleAction(r.id, 'rejected')} disabled={processingId === r.id}>
                                                    <XCircle className="w-4 h-4 mr-1.5" />Reject
                                                </Button>
                                            </div>
                                        )}
                                        <Link href={`/admin/moderation/${r.id}`} className={cn(activeFilter === 'pending' ? "sm:ml-auto" : "w-full")}>
                                            <Button variant="ghost" className="w-full rounded-lg h-10 text-indigo-600 hover:bg-indigo-50 gap-1 font-medium text-sm">
                                                View Details <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-white border-slate-200 rounded-xl">
                        <CardContent className="p-16 text-center">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-7 h-7 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">Queue Clear</h3>
                            <p className="text-slate-500 text-sm">{activeFilter === 'pending' ? 'All reports have been reviewed.' : `No ${activeFilter} reports found.`}</p>
                        </CardContent>
                    </Card>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
