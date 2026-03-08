'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { ArrowLeft, Calendar, MapPin, AlertTriangle, CheckCircle2, XCircle, Clock, User, FileText, Loader2, ImageIcon, ChevronRight, Info, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FadeInView } from '@/lib/animations';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminReviewPage() {
    const params = useParams();
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        async function fetchReport() {
            if (!params.id) return;
            try { const res = await fetch(`/api/reports/${params.id}`); if (res.ok) { const data = await res.json(); setReport(data.report); } else toast.error('Report not found'); }
            catch (e) { console.error(e); toast.error('Failed to load'); }
            setLoading(false);
        }
        fetchReport();
    }, [params.id]);

    const handleApprove = async () => {
        if (!report) return;
        setActionLoading(true);
        try { const res = await fetch(`/api/reports/${report.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) }); if (res.ok) { toast.success('Report approved'); router.push('/admin/moderation'); } else toast.error('Failed'); }
        catch { toast.error('Failed'); }
        setActionLoading(false);
    };
    const handleReject = async () => {
        if (!report || !rejectionReason.trim()) { toast.error('Please provide a reason'); return; }
        setActionLoading(true);
        try { const res = await fetch(`/api/reports/${report.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) }); if (res.ok) { toast.success('Report rejected'); router.push('/admin/moderation'); } else toast.error('Failed'); }
        catch { toast.error('Failed'); }
        setActionLoading(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-emerald-50 text-emerald-700 border-0 rounded-full font-medium text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected': return <Badge className="bg-red-50 text-red-700 border-0 rounded-full font-medium text-xs"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default: return <Badge className="bg-amber-50 text-amber-700 border-0 rounded-full font-medium text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        }
    };

    if (loading) return <DashboardLayout role={UserRole.ADMIN}><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div></DashboardLayout>;
    if (!report) return <DashboardLayout role={UserRole.ADMIN}><div className="text-center py-16"><FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" /><h2 className="text-xl font-bold text-slate-900 mb-2">Report Not Found</h2><Link href="/admin/moderation"><Button variant="outline" className="rounded-lg"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link></div></DashboardLayout>;

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-8 max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/admin/moderation" className="hover:text-indigo-600 transition-colors">Moderation</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-slate-900 font-medium">Review</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" className="w-10 h-10 rounded-lg border-slate-200" onClick={() => router.back()}><ArrowLeft className="w-4 h-4" /></Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{report.vehicle_make} {report.vehicle_model}</h1>
                            <p className="text-sm text-slate-500">VIN: {report.vehicle_vin || 'N/A'}</p>
                        </div>
                    </div>
                    {getStatusBadge(report.status)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
                            <CardHeader className="px-6 py-5 pb-3 border-b border-slate-100">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-indigo-600" />Photos
                                    {report.images && <Badge variant="secondary" className="rounded-full text-xs border-0 bg-slate-100 ml-1">{report.images.length}</Badge>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                    {report.images?.length > 0 ? (
                                        <img src={report.images[activeImageIndex]} alt="Evidence" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400"><ImageIcon className="w-12 h-12 mb-2" /><p className="text-sm">No photos uploaded</p></div>
                                    )}
                                </div>
                                {report.images?.length > 1 && (
                                    <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                        {report.images.map((img: string, idx: number) => (
                                            <button key={idx} onClick={() => setActiveImageIndex(idx)} className={cn("w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all", activeImageIndex === idx ? "border-indigo-500" : "border-slate-200 opacity-60 hover:opacity-100")}>
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        {report.status === 'pending' && (
                            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                                <CardHeader className="px-6 py-5 pb-3"><CardTitle className="text-lg font-semibold">Actions</CardTitle></CardHeader>
                                <CardContent className="px-6 pb-6 space-y-3">
                                    {!showRejectForm ? (
                                        <>
                                            <Button className="w-full rounded-lg h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-2" onClick={handleApprove} disabled={actionLoading}>
                                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" />Approve Report</>}
                                            </Button>
                                            <Button variant="outline" className="w-full rounded-lg h-11 text-red-600 hover:bg-red-50 border-red-200 font-medium gap-2" onClick={() => setShowRejectForm(true)} disabled={actionLoading}>
                                                <XCircle className="w-4 h-4" />Reject Report
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="space-y-3">
                                            <Label className="text-xs font-medium text-slate-700">Rejection Reason</Label>
                                            <Textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Explain why this report is being rejected..." className="rounded-lg bg-slate-50 border-slate-200 min-h-[100px]" />
                                            <div className="flex gap-2">
                                                <Button variant="outline" className="flex-1 rounded-lg h-10 border-slate-200" onClick={() => setShowRejectForm(false)}>Cancel</Button>
                                                <Button variant="destructive" className="flex-1 rounded-lg h-10" onClick={handleReject} disabled={actionLoading}>
                                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Rejection'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                            <CardHeader className="px-6 py-5 pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><User className="w-4 h-4 text-violet-600" />Contributor</CardTitle></CardHeader>
                            <CardContent className="px-6 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">{report.contributor?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'C'}</div>
                                    <div><p className="font-medium text-slate-900">{report.contributor?.full_name || 'Unknown'}</p><p className="text-xs text-slate-500">{report.contributor?.email || 'N/A'}</p></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                            <CardHeader className="px-6 py-5 pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><Info className="w-4 h-4 text-blue-600" />Vehicle Details</CardTitle></CardHeader>
                            <CardContent className="px-6 pb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label className="text-xs text-slate-500">Make</Label><p className="font-medium text-slate-900">{report.vehicle_make || 'N/A'}</p></div>
                                    <div><Label className="text-xs text-slate-500">Model</Label><p className="font-medium text-slate-900">{report.vehicle_model || 'N/A'}</p></div>
                                    <div className="col-span-2"><Label className="text-xs text-slate-500">VIN</Label><p className="font-mono text-sm text-indigo-600 bg-slate-50 p-3 rounded-lg border border-slate-100 break-all">{report.vehicle_vin || 'N/A'}</p></div>
                                    <div><Label className="text-xs text-slate-500">Plate</Label><p className="font-medium text-slate-900">{report.vehicle_plate || 'N/A'}</p></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                            <CardHeader className="px-6 py-5 pb-3">
                                <div className="flex items-center justify-between w-full">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" />Incident</CardTitle>
                                    {report.severity && <Badge className={cn("rounded-full font-medium text-xs border-0 capitalize", report.severity === 'minor' ? 'bg-amber-50 text-amber-700' : report.severity === 'moderate' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700')}>{report.severity}</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 pb-6 space-y-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600"><Calendar className="w-4 h-4 text-slate-400" />{report.accident_date ? new Date(report.accident_date).toLocaleDateString() : 'N/A'}</div>
                                {report.description && <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed">{report.description}</p>}
                                {report.latitude && report.longitude && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100"><MapPin className="w-4 h-4 text-indigo-500" />{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </FadeInView>
        </DashboardLayout>
    );
}
