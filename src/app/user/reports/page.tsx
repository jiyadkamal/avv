'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { 
    FileText, CheckCircle2, XCircle, Clock, 
    ChevronRight, Loader2, Plus, Car, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function UserReportsPage() {
    const { user } = useAuthStore();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        async function fetchReports() {
            if (!user?.id) { setLoading(false); return; }
            try { 
                const res = await fetch(`/api/reports?contributor_id=${user.id}`); 
                const data = await res.json(); 
                setReports(data.reports || []); 
            }
            catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchReports();
    }, [user?.id]);

    const filteredReports = reports.filter(r => filter === 'all' || r.status === filter);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-lg px-3 py-1 font-bold text-[10px] uppercase"><CheckCircle2 className="w-3 h-3 mr-1.5" />Approved</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-700 border-0 rounded-lg px-3 py-1 font-bold text-[10px] uppercase"><XCircle className="w-3 h-3 mr-1.5" />Rejected</Badge>;
            default: return <Badge className="bg-amber-100 text-amber-700 border-0 rounded-lg px-3 py-1 font-bold text-[10px] uppercase"><Clock className="w-3 h-3 mr-1.5" />Pending</Badge>;
        }
    };

    return (
        <DashboardLayout role={UserRole.USER}>
            <FadeInView delay={0.1} className="space-y-8 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">My Reports</h1>
                        <p className="text-slate-500">History of all accident reports you've submitted.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-40">
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-slate-400" />
                                        <SelectValue placeholder="All Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Reports</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Link href="/user/upload">
                            <Button className="h-11 rounded-xl px-6 font-bold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus className="w-4 h-4" /> New Report
                            </Button>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse" />)}
                    </div>
                ) : filteredReports.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredReports.map((r, i) => (
                            <FadeInView key={r.id} delay={0.1 + i * 0.05}>
                                <Link href={`/user/reports/${r.id}`}>
                                    <Card className="bg-white border-slate-100 shadow-sm rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="flex items-center p-5 gap-4">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                                                    r.status === 'approved' ? "bg-emerald-50 text-emerald-600" :
                                                    r.status === 'rejected' ? "bg-red-50 text-red-600" : 
                                                    "bg-amber-50 text-amber-600"
                                                )}>
                                                    <Car className="w-7 h-7" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <p className="text-lg font-bold text-slate-900 truncate">
                                                            {r.vehicle_make} {r.vehicle_model}
                                                        </p>
                                                        {r.is_workshop_report && (
                                                            <Badge className="bg-emerald-50 text-emerald-600 border-0 rounded-md px-1.5 py-0 text-[9px] font-black uppercase">Workshop</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                            <span className="opacity-50 mr-1">VIN</span> {r.vehicle_vin?.slice(-8)}
                                                        </p>
                                                        <p className="text-xs font-medium text-slate-400 leading-none">
                                                            {new Date(r.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 shrink-0">
                                                    <div className="hidden sm:block">
                                                        {getStatusBadge(r.status)}
                                                    </div>
                                                    <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </FadeInView>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-white border-slate-100 rounded-[32px] border-2 border-dashed shadow-none">
                        <CardContent className="p-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No reports found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
                                {filter === 'all' 
                                    ? "You haven't submitted any accident reports yet. Start reporting to earn rewards." 
                                    : `You don't have any ${filter} reports at the moment.`}
                            </p>
                            {filter === 'all' && (
                                <Link href="/user/upload">
                                    <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg shadow-xl shadow-indigo-100">
                                        <Plus className="w-5 h-5 mr-2" /> Submit First Report
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
