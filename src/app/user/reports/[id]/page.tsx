'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { 
    ArrowLeft, Calendar, MapPin, AlertTriangle, CheckCircle2, 
    XCircle, Clock, FileText, Loader2, ImageIcon, 
    ChevronRight, Info, Wrench, Receipt, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FadeInView } from '@/lib/animations';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function UserReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        async function fetchReport() {
            try { 
                const res = await fetch(`/api/reports/${id}`); 
                if (res.ok) { 
                    const data = await res.json(); 
                    setReport(data.report); 
                } else {
                    toast.error('Report not found'); 
                }
            }
            catch (e) { 
                console.error(e); 
                toast.error('Failed to load report'); 
            }
            setLoading(false);
        }
        fetchReport();
    }, [id]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-lg px-4 py-1.5 font-bold text-xs uppercase"><CheckCircle2 className="w-4 h-4 mr-2" />Approved</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-700 border-0 rounded-lg px-4 py-1.5 font-bold text-xs uppercase"><XCircle className="w-4 h-4 mr-2" />Rejected</Badge>;
            default: return <Badge className="bg-amber-100 text-amber-700 border-0 rounded-lg px-4 py-1.5 font-bold text-xs uppercase"><Clock className="w-4 h-4 mr-2" />Pending</Badge>;
        }
    };

    if (loading) return <DashboardLayout role={UserRole.USER}><div className="flex items-center justify-center h-96"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div></DashboardLayout>;
    
    if (!report) return (
        <DashboardLayout role={UserRole.USER}>
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
                <FileText className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">The report you are looking for doesn't exist or has been removed.</p>
                <Link href="/user/reports">
                    <Button variant="outline" className="rounded-xl h-12 px-6 border-slate-200">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Reports
                    </Button>
                </Link>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role={UserRole.USER}>
            <FadeInView delay={0.1} className="space-y-8 max-w-6xl mx-auto">
                {/* Navigation & Header */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                        <Link href="/user/reports" className="hover:text-indigo-600 transition-colors">My Reports</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900">Report #{report.id.slice(0, 8)}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="w-12 h-12 rounded-2xl border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all shrink-0" 
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                        {report.vehicle_make} {report.vehicle_model}
                                    </h1>
                                    {report.is_workshop_report && (
                                        <Badge className="bg-emerald-50 text-emerald-600 border-0 rounded-md px-2 py-0.5 text-[10px] font-black uppercase">Workshop Verified</Badge>
                                    )}
                                </div>
                                <p className="text-slate-500 font-medium">VIN: {report.vehicle_vin || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(report.status)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Media Section */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100">
                            <CardContent className="p-8">
                                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative group">
                                    {report.images?.length > 0 ? (
                                        <img src={report.images[activeImageIndex]} alt="Accident Evidence" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                            <ImageIcon className="w-16 h-16 mb-4" />
                                            <p className="font-bold uppercase tracking-widest text-xs">No photos provided</p>
                                        </div>
                                    )}
                                    {report.severity && (
                                        <div className="absolute top-6 left-6">
                                            <Badge className={cn(
                                                "rounded-lg px-3 py-1.5 font-bold text-xs uppercase border-0 shadow-lg",
                                                report.severity === 'severe' ? 'bg-red-500 text-white' : 
                                                report.severity === 'moderate' ? 'bg-amber-500 text-white' : 
                                                'bg-emerald-500 text-white'
                                            )}>
                                                {report.severity} Damage
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                {report.images?.length > 1 && (
                                    <div className="flex gap-4 mt-6 overflow-x-auto pb-2 scrollbar-none">
                                        {report.images.map((img: string, idx: number) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => setActiveImageIndex(idx)} 
                                                className={cn(
                                                    "w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all shadow-sm",
                                                    activeImageIndex === idx ? "border-indigo-600 scale-95" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                                                )}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Description Card */}
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100">
                            <CardHeader className="px-8 py-6 bg-slate-50/50">
                                <CardTitle className="text-xl font-bold flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-indigo-600" /> Damage Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <p className="text-slate-600 leading-relaxed text-lg italic">
                                    "{report.description || 'No description provided.'}"
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Side Info Section */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Highlights */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="border-none shadow-sm rounded-3xl bg-indigo-600 text-white">
                                <CardContent className="p-6">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Incident Date</Label>
                                    <p className="text-xl font-bold mt-1 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-indigo-300" />
                                        {report.accident_date ? new Date(report.accident_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white">
                                <CardContent className="p-6">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Report ID</Label>
                                    <p className="text-xl font-mono font-bold mt-1 text-slate-300">
                                        #{report.id.slice(0, 8)}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Vehicle Details Card */}
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100">
                            <CardHeader className="px-8 py-6 border-b border-slate-50">
                                <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-900">
                                    <Info className="w-5 h-5 text-blue-600" /> Vehicle Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manufacturer</Label>
                                        <p className="text-lg font-bold text-slate-900 mt-1">{report.vehicle_make || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle Model</Label>
                                        <p className="text-lg font-bold text-slate-900 mt-1">{report.vehicle_model || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4">
                                    <div>
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full VIN</Label>
                                        <p className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mt-2 break-all">
                                            {report.vehicle_vin || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">License Plate</Label>
                                        <p className="text-lg font-bold text-slate-900 mt-1">{report.vehicle_plate || 'NOT PROVIDED'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Workshop Details Section (Conditional) */}
                        {report.is_workshop_report && (
                            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-emerald-50 border border-emerald-100">
                                <CardHeader className="px-8 py-6 bg-emerald-100/50">
                                    <CardTitle className="text-lg font-bold flex items-center gap-3 text-emerald-900">
                                        <Wrench className="w-5 h-5" /> Workshop Service Log
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div>
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-700/60">Services Rendered</Label>
                                        <p className="text-sm font-medium text-emerald-900 mt-2 leading-relaxed whitespace-pre-wrap">
                                            {report.service_details || 'No service details provided.'}
                                        </p>
                                    </div>
                                    {report.replaced_parts && (
                                        <div>
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-700/60">Parts Replaced</Label>
                                            <p className="text-sm font-bold text-emerald-900 mt-1">
                                                {report.replaced_parts}
                                            </p>
                                        </div>
                                    )}
                                    {report.invoice_url && (
                                        <div className="pt-4">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    try {
                                                        // Convert base64 data URI to blob and download
                                                        const dataUri = report.invoice_url;
                                                        const [header, base64] = dataUri.split(',');
                                                        const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
                                                        const binary = atob(base64);
                                                        const bytes = new Uint8Array(binary.length);
                                                        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                                                        const blob = new Blob([bytes], { type: mime });
                                                        const url = URL.createObjectURL(blob);
                                                        const ext = mime.includes('pdf') ? '.pdf' : mime.includes('png') ? '.png' : '.jpg';
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `invoice-${report.id.slice(0, 8)}${ext}`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        document.body.removeChild(a);
                                                        URL.revokeObjectURL(url);
                                                    } catch (e) {
                                                        console.error('Download failed:', e);
                                                    }
                                                }}
                                                className="flex items-center justify-between w-full p-4 bg-white rounded-2xl border border-emerald-200 hover:border-emerald-500 transition-all group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Receipt className="w-5 h-5 text-emerald-600" />
                                                    <span className="text-sm font-bold text-emerald-900">Download Service Invoice</span>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600" />
                                            </button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Location Mini Card */}
                        {(report.address || (report.latitude && report.longitude)) && (
                            <Card className="border-none shadow-sm rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600 shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Incident Location</Label>
                                            {report.address ? (
                                                <p className="text-sm font-bold text-slate-700 mt-0.5 leading-relaxed">
                                                    {report.address}
                                                </p>
                                            ) : (
                                                <p className="text-sm font-bold text-slate-700 mt-0.5">
                                                    {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </FadeInView>
        </DashboardLayout>
    );
}
