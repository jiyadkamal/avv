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
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link href="/admin/moderation" className="hover:text-primary transition-colors">Queue</Link>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <span className="font-medium text-slate-900 truncate max-w-[200px]">Review {report.id.slice(0, 8)}...</span>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                    <div className="flex items-center gap-5">
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-12 h-12 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shrink-0"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Review Report</h1>
                            <p className="text-slate-500 font-bold text-sm tracking-wider uppercase mt-1">
                                REF: {report.vehicle_make} {report.vehicle_model}
                            </p>
                        </div>
                    </div>
                    {getStatusBadge(report.status)}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Evidence Images */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="border-none shadow-[0_4px_25px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                                <CardTitle className="text-xl font-extrabold flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    Evidence Images
                                    {report.images && (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold px-2 rounded-md border-none ml-2 text-[10px] tracking-wider uppercase">
                                            {report.images.length} Photos
                                        </Badge>
                                    )}
                                </CardTitle>
                                <Button variant="link" className="text-[#3b82f6] font-bold text-sm h-auto p-0 hover:no-underline">View All</Button>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
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
                                        <div className="grid grid-cols-5 gap-4">
                                            {report.images.slice(0, 5).map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveImageIndex(idx)}
                                                    className={cn(
                                                        "aspect-square rounded-2xl overflow-hidden bg-slate-100 transition-all border-2",
                                                        activeImageIndex === idx ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                                                    )}
                                                >
                                                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                            {report.images.length > 5 && (
                                                <div className="aspect-square rounded-2xl bg-slate-900/5 flex items-center justify-center text-slate-500 text-sm font-bold border-2 border-dashed border-slate-200">
                                                    +{report.images.length - 5}
                                                </div>
                                            )}
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
                            <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-[32px] overflow-hidden bg-white border border-slate-100">
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex items-center justify-between w-full">
                                        <CardTitle className="text-xl font-extrabold flex items-center gap-3">
                                            Actions
                                        </CardTitle>
                                        <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase border-slate-200 text-slate-400 px-3 py-1">Moderator Review</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-6 space-y-4">
                                    {!showRejectForm ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button
                                                className="w-full rounded-2xl h-14 font-black uppercase tracking-wider text-xs bg-slate-900 hover:bg-slate-800 shadow-lg text-white gap-2"
                                                onClick={handleApprove}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                        Approve
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-2xl h-14 font-black uppercase tracking-wider text-xs border-rose-100 text-rose-600 hover:bg-rose-50 gap-2"
                                                onClick={() => setShowRejectForm(true)}
                                                disabled={actionLoading}
                                            >
                                                <XCircle className="w-5 h-5" />
                                                Reject
                                            </Button>
                                        </div>
                                    ) : (
                                        <FadeInView delay={0} className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black text-slate-400 tracking-widest uppercase block">Rejection Reason</Label>
                                                <Textarea
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    placeholder="Explain why this report is being rejected... (e.g., blurry images, incorrect VIN)"
                                                    className="mt-2 rounded-[24px] border-slate-200 p-6 min-h-[140px] focus:ring-rose-200 focus:border-rose-300 resize-none text-slate-700 font-medium"
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <Button
                                                    variant="secondary"
                                                    className="flex-1 rounded-2xl h-12 font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    onClick={() => setShowRejectForm(false)}
                                                    disabled={actionLoading}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="flex-1 rounded-2xl h-12 font-black uppercase tracking-wider text-xs shadow-lg bg-rose-600 hover:bg-rose-700"
                                                    onClick={handleReject}
                                                    disabled={actionLoading}
                                                >
                                                    {actionLoading ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        'Confirm Rejection'
                                                    )}
                                                </Button>
                                            </div>
                                        </FadeInView>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Contributor Info */}
                        <Card className="border-none shadow-[0_4px_25px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="p-8 pb-4 border-b border-slate-50 text-emerald-200">
                                <CardTitle className="text-lg font-extrabold flex items-center gap-3 text-slate-900">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                        <User className="w-4 h-4 text-slate-500" />
                                    </div>
                                    Contributor Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/5">
                                        <span className="font-black text-xl text-primary uppercase">
                                            {contributor?.full_name?.split(' ').map(n => n[0]).join('') || 'C'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-lg text-slate-900 leading-tight">{contributor?.full_name || 'Unknown Contributor'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            <p className="text-sm font-medium text-slate-500">{contributor?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Information */}
                        <Card className="border-none shadow-[0_4px_25px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="p-8 pb-4 border-b border-slate-50">
                                <CardTitle className="text-lg font-extrabold flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Info className="w-4 h-4 text-primary" />
                                    </div>
                                    Vehicle Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-6">
                                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">Make</Label>
                                        <p className="text-lg font-extrabold text-slate-900">{report.vehicle_make || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1 text-right md:text-left">
                                        <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">Model</Label>
                                        <p className="text-lg font-extrabold text-slate-900">{report.vehicle_model || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">VIN</Label>
                                        <p className="text-lg font-extrabold text-slate-900 tracking-tight">{report.vehicle_vin || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1 text-right md:text-left">
                                        <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">License Plate</Label>
                                        <p className="text-lg font-extrabold text-slate-900">{report.vehicle_plate || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Accident Details */}
                        <Card className="border-none shadow-[0_4px_25px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="p-8 pb-4 border-b border-slate-50">
                                <div className="flex items-center justify-between w-full">
                                    <CardTitle className="text-lg font-extrabold flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                                        </div>
                                        Accident Details
                                    </CardTitle>
                                    {report.severity && (
                                        <Badge className={cn("rounded-md px-3 py-1 font-black text-[9px] tracking-[0.1em] uppercase border shrink-0", getSeverityColor(report.severity))}>
                                            {report.severity} Severity
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-6 space-y-8">
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
                                        <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">Location Coordinates</Label>
                                        <div className="flex items-center gap-3 mt-3 bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200 group hover:border-emerald-300 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                                                <MapPin className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <p className="font-mono text-base font-bold text-slate-900">
                                                {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Report Metadata */}
                        <Card className="border-none shadow-[0_4px_25px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden bg-white p-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 block">Submission Date</Label>
                                    <p className="text-xl font-extrabold text-slate-900">
                                        {report.created_at ? new Date(report.created_at).toLocaleDateString('en-GB') : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 block text-right">Report ID</Label>
                                    <p className="text-sm font-mono font-bold text-slate-400 text-right truncate">
                                        {report.id}
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
