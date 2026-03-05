'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import {
    ArrowLeft,
    Car,
    Calendar,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    FileText,
    Loader2,
    ImageIcon,
    ChevronRight,
    Info,
    Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { FadeInView } from '@/lib/animations';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Report {
    id: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_vin: string;
    vehicle_plate: string;
    description: string;
    severity: string;
    accident_date: string;
    latitude: number;
    longitude: number;
    status: string;
    created_at: string;
    contributor_id: string;
    images: string[];
}

interface Contributor {
    id: string;
    full_name: string;
    email: string;
}

export default function AdminReviewPage() {
    const params = useParams();
    const router = useRouter();
    const [report, setReport] = useState<Report | null>(null);
    const [contributor, setContributor] = useState<Contributor | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        async function fetchReport() {
            if (!params.id) return;

            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) {
                console.error('Error fetching report:', error);
                toast.error('Failed to load report');
                setLoading(false);
                return;
            }

            setReport(data);

            // Fetch contributor info
            if (data?.contributor_id) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .eq('id', data.contributor_id)
                    .single();

                if (profile) {
                    setContributor(profile);
                }
            }

            setLoading(false);
        }

        fetchReport();
    }, [params.id]);

    const handleApprove = async () => {
        if (!report) return;
        setActionLoading(true);

        const { error } = await supabase
            .from('reports')
            .update({ status: 'approved' })
            .eq('id', report.id);

        if (error) {
            toast.error('Failed to approve report');
        } else {
            toast.success('Report approved successfully');
            router.push('/admin/moderation');
        }
        setActionLoading(false);
    };

    const handleReject = async () => {
        if (!report) return;
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setActionLoading(true);

        const { error } = await supabase
            .from('reports')
            .update({
                status: 'rejected',
                // rejection_reason: rejectionReason // uncomment if column exists
            })
            .eq('id', report.id);

        if (error) {
            toast.error('Failed to reject report');
        } else {
            toast.success('Report rejected');
            router.push('/admin/moderation');
        }
        setActionLoading(false);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case 'minor': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'moderate': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'severe': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-full font-bold px-4 py-1 gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-rose-50 text-rose-600 border-rose-100 rounded-full font-bold px-4 py-1 gap-1.5"><XCircle className="w-3.5 h-3.5" /> Rejected</Badge>;
            default:
                return <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-full font-bold px-4 py-1 gap-1.5"><Clock className="w-3.5 h-3.5" /> Review Pending</Badge>;
        }
    };

    if (loading) {
        return (
            <DashboardLayout role={UserRole.ADMIN}>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!report) {
        return (
            <DashboardLayout role={UserRole.ADMIN}>
                <div className="text-center py-16">
                    <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Report Not Found</h2>
                    <p className="text-muted-foreground mb-4">The report you're looking for doesn't exist.</p>
                    <Link href="/admin/moderation">
                        <Button variant="outline" className="rounded-xl">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Queue
                        </Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-6 max-w-[1200px] mx-auto pb-12">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mb-2 overflow-hidden whitespace-nowrap">
                    <Link href="/admin/moderation" className="hover:text-primary transition-colors shrink-0">Queue</Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span className="font-medium text-slate-900 truncate">Review {report.id.slice(0, 8)}...</span>
                </div>

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 pb-2">
                    <div className="flex items-center gap-3 md:gap-5 min-w-0">
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shrink-0"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                        <div className="min-w-0">
                            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">Review Report</h1>
                            <p className="text-slate-500 font-bold text-[10px] md:text-sm tracking-widest uppercase mt-0.5 truncate">
                                REF: {report.vehicle_make} {report.vehicle_model}
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 w-fit">
                        {getStatusBadge(report.status)}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Evidence Images */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="border-none shadow-sm rounded-2xl md:rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="flex flex-row items-center justify-between p-5 md:p-8 pb-4">
                                <CardTitle className="text-lg md:text-xl font-extrabold flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    Evidence
                                    {report.images && (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold px-2 rounded-md border-none ml-1 text-[9px] tracking-wider uppercase">
                                            {report.images.length}
                                        </Badge>
                                    )}
                                </CardTitle>
                                <Button variant="link" className="text-[#3b82f6] font-bold text-xs md:text-sm h-auto p-0 hover:no-underline">View All</Button>
                            </CardHeader>
                            <CardContent className="p-5 md:p-8 pt-0">
                                <div className="space-y-6">
                                    {/* Main Image View */}
                                    <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-slate-100 group shadow-inner">
                                        {report.images && report.images.length > 0 ? (
                                            <>
                                                <img
                                                    src={report.images[activeImageIndex]}
                                                    alt="Evidence"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                {/* Location Tag */}
                                                {(report.latitude && report.longitude) && (
                                                    <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl text-white text-xs font-bold border border-white/20">
                                                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                                        {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                                                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center">
                                                    <ImageIcon className="w-8 h-8 opacity-20" />
                                                </div>
                                                <p className="font-bold">No evidence images provided</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Thumbnails */}
                                    {report.images && report.images.length > 1 && (
                                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                                            {report.images.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveImageIndex(idx)}
                                                    className={cn(
                                                        "w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 transition-all border-2",
                                                        activeImageIndex === idx ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                                                    )}
                                                >
                                                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Information Cards */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Admin Actions */}
                        {report.status === 'pending' && (
                            <Card className="border-none shadow-sm rounded-2xl md:rounded-[32px] overflow-hidden bg-white">
                                <CardHeader className="p-6 md:p-8 pb-4">
                                    <div className="flex items-center justify-between w-full">
                                        <CardTitle className="text-lg md:text-xl font-extrabold">
                                            Mod Actions
                                        </CardTitle>
                                        <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-slate-200 text-slate-400 px-2 py-0.5">Moderator</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8 pt-6 space-y-4">
                                    {!showRejectForm ? (
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                className="w-full rounded-xl md:rounded-2xl h-12 md:h-14 font-black uppercase tracking-wider text-xs bg-slate-900 hover:bg-slate-800 shadow-lg text-white gap-2"
                                                onClick={handleApprove}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                        Approve Report
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-xl md:rounded-2xl h-12 md:h-14 font-black uppercase tracking-wider text-xs border-rose-100 text-rose-600 hover:bg-rose-50 gap-2"
                                                onClick={() => setShowRejectForm(true)}
                                                disabled={actionLoading}
                                            >
                                                <XCircle className="w-5 h-5" />
                                                Reject Report
                                            </Button>
                                        </div>
                                    ) : (
                                        <FadeInView delay={0} className="space-y-4 md:space-y-6">
                                            <div className="space-y-2 md:space-y-3">
                                                <Label className="text-[10px] font-black text-slate-400 tracking-widest uppercase block">Rejection Reason</Label>
                                                <Textarea
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    placeholder="e.g. Blurry images, incorrect VIN..."
                                                    className="rounded-xl md:rounded-[24px] border-slate-200 p-4 md:p-6 min-h-[120px] md:min-h-[140px] focus:ring-rose-200 focus:border-rose-300 resize-none text-sm text-slate-700"
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="secondary"
                                                    className="flex-1 rounded-xl h-11 md:h-12 font-bold bg-slate-100 text-slate-600 text-xs"
                                                    onClick={() => setShowRejectForm(false)}
                                                    disabled={actionLoading}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="flex-[2] rounded-xl h-11 md:h-12 font-black uppercase tracking-wider text-[10px] shadow-lg bg-rose-600 hover:bg-rose-700"
                                                    onClick={handleReject}
                                                    disabled={actionLoading}
                                                >
                                                    {actionLoading ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        'Confirm Reject'
                                                    )}
                                                </Button>
                                            </div>
                                        </FadeInView>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Contributor Info */}
                        <Card className="border-none shadow-sm rounded-2xl md:rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="p-6 md:p-8 pb-4 border-b border-slate-50 text-emerald-200">
                                <CardTitle className="text-base md:text-lg font-extrabold flex items-center gap-3 text-slate-900">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                        <User className="w-4 h-4 text-slate-500" />
                                    </div>
                                    Contributor
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8 pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/5 shrink-0">
                                        <span className="font-black text-lg md:text-xl text-primary uppercase">
                                            {contributor?.full_name?.split(' ').map(n => n[0]).join('') || 'C'}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-extrabold text-base md:text-lg text-slate-900 leading-tight truncate">{contributor?.full_name || 'Unknown'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-400" />
                                            <p className="text-xs md:text-sm font-medium text-slate-500 truncate">{contributor?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Information */}
                        <Card className="border-none shadow-sm rounded-2xl md:rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="p-6 md:p-8 pb-4 border-b border-slate-50">
                                <CardTitle className="text-base md:text-lg font-extrabold flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Info className="w-4 h-4 text-primary" />
                                    </div>
                                    Vehicle Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8 pt-6">
                                <div className="grid grid-cols-2 gap-y-6 md:gap-y-8 gap-x-6 md:gap-x-12">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">Make</Label>
                                        <p className="text-base md:text-lg font-extrabold text-slate-900">{report.vehicle_make || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">Model</Label>
                                        <p className="text-base md:text-lg font-extrabold text-slate-900">{report.vehicle_model || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2 xs:col-span-1">
                                        <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">VIN</Label>
                                        <p className="text-base md:text-lg font-extrabold text-slate-900 tracking-tight break-all">{report.vehicle_vin || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2 xs:col-span-1">
                                        <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">Plate</Label>
                                        <p className="text-base md:text-lg font-extrabold text-slate-900">{report.vehicle_plate || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Accident Details */}
                        <Card className="border-none shadow-sm rounded-2xl md:rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="p-6 md:p-8 pb-4 border-b border-slate-50">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                                    <CardTitle className="text-base md:text-lg font-extrabold flex items-center gap-3 text-slate-900">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                                        </div>
                                        Accident History
                                    </CardTitle>
                                    {report.severity && (
                                        <Badge className={cn("rounded-md px-3 py-1 font-black text-[9px] tracking-[0.1em] uppercase border shrink-0 w-fit", getSeverityColor(report.severity))}>
                                            {report.severity} Severity
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8 pt-6 space-y-6 md:space-y-8">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">Occurrence Date</Label>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <p className="text-lg font-extrabold text-slate-900">
                                            {report.accident_date ? new Date(report.accident_date).toLocaleDateString('en-GB') : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black text-slate-400 tracking-widest uppercase block">Description</Label>
                                    <p className="text-slate-600 font-medium leading-relaxed text-sm mt-3 bg-slate-50/50 p-6 rounded-[24px] border border-slate-100/50">
                                        {report.description || 'No description provided.'}
                                    </p>
                                </div>

                                {(report.latitude && report.longitude) && (
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">GPS Location</Label>
                                        <div className="flex items-center gap-3 mt-2 bg-slate-50/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-dashed border-slate-200 group hover:border-emerald-300 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                                                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                            </div>
                                            <p className="font-mono text-sm md:text-base font-bold text-slate-900 truncate">
                                                {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Report Metadata */}
                        <Card className="border-none shadow-sm rounded-2xl md:rounded-[32px] overflow-hidden bg-white p-6 md:p-8">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 block">Submission</Label>
                                    <p className="text-base md:text-xl font-extrabold text-slate-900">
                                        {report.created_at ? new Date(report.created_at).toLocaleDateString('en-GB') : 'N/A'}
                                    </p>
                                </div>
                                <div className="text-right min-w-0">
                                    <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 block">ID</Label>
                                    <p className="text-xs md:text-sm font-mono font-bold text-slate-400 truncate">
                                        {report.id.split('-')[0]}...
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </FadeInView>
        </DashboardLayout>
    );
}
