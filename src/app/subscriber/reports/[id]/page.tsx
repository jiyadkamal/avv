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
    FileText,
    Loader2,
    ImageIcon,
    Bookmark,
    BookmarkCheck,
    ChevronRight,
    Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FadeInView } from '@/lib/animations';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
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
    images: string[];
}

export default function SubscriberReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        async function fetchReport() {
            if (!params.id) return;

            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('id', params.id)
                .eq('status', 'approved')
                .single();

            if (error) {
                console.error('Error fetching report:', error);
                setLoading(false);
                return;
            }

            setReport(data);
            setLoading(false);

            // Check if saved
            if (user?.id) {
                const { data: savedData } = await supabase
                    .from('saved_reports')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('report_id', params.id)
                    .single();
                setIsSaved(!!savedData);
            }
        }

        fetchReport();
    }, [params.id, user?.id]);

    const handleSaveToggle = async () => {
        if (!user?.id || !report?.id) return;

        setSaving(true);

        if (isSaved) {
            await supabase
                .from('saved_reports')
                .delete()
                .eq('user_id', user.id)
                .eq('report_id', report.id);
            setIsSaved(false);
            toast.success('Report removed from saved');
        } else {
            await supabase
                .from('saved_reports')
                .insert({ user_id: user.id, report_id: report.id });
            setIsSaved(true);
            toast.success('Report saved!');
        }

        setSaving(false);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case 'minor': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'moderate': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'severe': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (loading) {
        return (
            <DashboardLayout role={UserRole.SUBSCRIBER}>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!report) {
        return (
            <DashboardLayout role={UserRole.SUBSCRIBER}>
                <div className="text-center py-16">
                    <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Report Not Found</h2>
                    <p className="text-muted-foreground mb-4">The report you're looking for doesn't exist or is not accessible.</p>
                    <Link href="/subscriber/search">
                        <Button variant="outline" className="rounded-xl">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
                        </Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role={UserRole.SUBSCRIBER}>
            <FadeInView delay={0.1} className="space-y-6 max-w-[1200px] mx-auto pb-12">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link href="/subscriber/search" className="hover:text-primary transition-colors">Reports</Link>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <span className="font-medium text-slate-900 truncate max-w-[200px]">Report {report.id.slice(0, 8)}...</span>
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
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Vehicle Report</h1>
                            <p className="text-slate-500 font-bold text-sm tracking-wider uppercase mt-1">
                                REF: {report.vehicle_make} {report.vehicle_model}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant={isSaved ? "default" : "outline"}
                        className={cn(
                            "h-12 px-8 rounded-2xl font-bold gap-2 transition-all shadow-sm border-slate-200",
                            isSaved ? "bg-slate-900 hover:bg-slate-800 text-white border-transparent" : "text-slate-700 hover:bg-slate-50"
                        )}
                        onClick={handleSaveToggle}
                        disabled={saving}
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isSaved ? (
                            <BookmarkCheck className="w-5 h-5" />
                        ) : (
                            <Bookmark className="w-5 h-5" />
                        )}
                        {isSaved ? 'Saved' : 'Save Report'}
                    </Button>
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
                        {/* Report Metadata */}
                        <Card className="border-none shadow-[0_4px_25px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden bg-white p-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 block">Report Date</Label>
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
                                    <Label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">Description</Label>
                                    <p className="text-slate-600 font-medium leading-relaxed text-sm mt-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
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
                    </div>
                </div>
            </FadeInView>
        </DashboardLayout>
    );
}
