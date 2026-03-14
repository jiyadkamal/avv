'use client';

import { useEffect, useState, Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole, WorkshopStatus } from '@/types';
import { 
    ShieldCheck, CheckCircle, XCircle, Clock, 
    FileText, Calendar, Loader2, ChevronRight,
    Wrench, FileImage, MapPin, Hash, Trash2, 
    ExternalLink, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FadeInView } from '@/lib/animations';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

function ModerationContent() {
    const searchParams = useSearchParams();
    const [reports, setReports] = useState<any[]>([]);
    const [workshopRequests, setWorkshopRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'reports');

    // Fetch both on mount so badge counts are correct
    useEffect(() => {
        fetchReports();
        fetchWorkshopRequests();
    }, []);

    // Also refresh when switching tabs
    useEffect(() => {
        if (activeTab === 'reports') {
            fetchReports();
        } else if (activeTab === 'workshops') {
            fetchWorkshopRequests();
        }
    }, [activeTab]);

    async function fetchReports() {
        setLoading(true);
        try { 
            const res = await fetch(`/api/reports?status=pending`); 
            const data = await res.json(); 
            setReports(data.reports || []); 
        }
        catch (e) { 
            console.error(e); 
            toast.error('Failed to load reports'); 
        }
        setLoading(false);
    }

    async function fetchWorkshopRequests() {
        setLoading(true);
        try {
            const res = await fetch('/api/workshop-request');
            const data = await res.json();
            setWorkshopRequests(data.requests || []);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load workshop requests');
        }
        setLoading(false);
    }

    const handleReportAction = async (id: string, action: 'approved' | 'rejected') => {
        setProcessingId(id);
        try { 
            const res = await fetch(`/api/reports/${id}`, { 
                method: 'PATCH', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ status: action }) 
            }); 
            if (res.ok) { 
                setReports(prev => prev.filter(r => r.id !== id)); 
                toast.success(`Report ${action}!`); 
            } else {
                toast.error('Failed to update report');
            }
        }
        catch { 
            toast.error('Server error'); 
        }
        setProcessingId(null);
    };

    const handleWorkshopAction = async (requestId: string, action: 'approved' | 'rejected') => {
        setProcessingId(requestId);
        try {
            const res = await fetch(`/api/workshop-request/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });
            if (res.ok) {
                setWorkshopRequests(prev => prev.filter(r => r.id !== requestId));
                toast.success(`Workshop request ${action}!`);
            } else {
                toast.error('Failed to update request');
            }
        } catch (e) {
            toast.error('Server error');
        }
        setProcessingId(null);
    };

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">Moderation Hub</h1>
                        <p className="text-slate-500">Review pending vehicle reports and workshop applications.</p>
                    </div>
                </div>

                <Tabs defaultValue="reports" className="space-y-8" onValueChange={setActiveTab}>
                    <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 w-full md:w-auto flex overflow-x-auto whitespace-nowrap scrollbar-none">
                        <TabsTrigger value="reports" className="rounded-xl px-8 h-12 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Report Queue
                            <Badge className="ml-2 bg-slate-200 text-slate-600 border-0 h-5 px-1.5 font-bold">{reports.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="workshops" className="rounded-xl px-8 h-12 font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">
                            <Wrench className="w-4 h-4 mr-2" />
                            Workshop Requests
                            <Badge className="ml-2 bg-emerald-100 text-emerald-600 border-0 h-5 px-1.5 font-bold">{workshopRequests.length}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    {/* Reports Tab */}
                    <TabsContent value="reports" className="space-y-6">
                        {loading ? (
                            <div className="grid grid-cols-1 gap-6">
                                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white border border-slate-100 rounded-[32px] animate-pulse" />)}
                            </div>
                        ) : reports.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {reports.map((r) => (
                                    <Card key={r.id} className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100 transition-all hover:shadow-md">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row">
                                                <div className="w-full lg:w-72 aspect-video lg:aspect-square bg-slate-50 relative shrink-0">
                                                    {r.images?.[0] ? (
                                                        <img src={r.images[0]} alt="Evidence" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <FileImage className="w-12 h-12" />
                                                        </div>
                                                    )}
                                                    {r.severity && (
                                                        <div className="absolute top-4 left-4">
                                                            <Badge className={cn(
                                                                "rounded-lg px-2 py-1 font-bold text-[10px] uppercase border-0 shadow-lg",
                                                                r.severity === 'severe' ? 'bg-red-500 text-white' : 
                                                                r.severity === 'moderate' ? 'bg-amber-500 text-white' : 
                                                                'bg-emerald-500 text-white'
                                                            )}>
                                                                {r.severity}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-8 flex-1 flex flex-col justify-between">
                                                    <div className="space-y-4">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <div className="flex items-center gap-3">
                                                                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                                                                        {r.vehicle_make} {r.vehicle_model}
                                                                    </h3>
                                                                    {r.is_workshop_report && (
                                                                        <Badge className="bg-emerald-50 text-emerald-600 border-0 rounded-md px-1.5 py-0 text-[10px] font-black uppercase">Workshop</Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-2">
                                                                    VIN: <span className="font-mono text-slate-600 tracking-wider font-bold">{r.vehicle_vin || 'N/A'}</span>
                                                                </p>
                                                            </div>
                                                            <Link href={`/admin/moderation/${r.id}`}>
                                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600">
                                                                    <ChevronRight className="w-6 h-6" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed italic">
                                                            "{r.description || 'No description provided.'}"
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-6 pt-2">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                                <Calendar className="w-4 h-4" /> {new Date(r.created_at).toLocaleDateString()}
                                                            </div>
                                                            {r.address && (
                                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 leading-none">
                                                                    <MapPin className="w-4 h-4" /> <span className="normal-case tracking-normal truncate max-w-xs">{r.address}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                                <ExternalLink className="w-4 h-4" /> Contributor: {r.contributor_id?.slice(0, 8)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-50">
                                                        <Button 
                                                            className="flex-1 rounded-2xl h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-lg shadow-indigo-100 gap-2"
                                                            onClick={() => handleReportAction(r.id, 'approved')}
                                                            disabled={!!processingId}
                                                        >
                                                            {processingId === r.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                                            Approve Report
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            className="flex-1 rounded-2xl h-14 border-red-100 text-red-600 hover:bg-red-50 font-bold gap-2"
                                                            onClick={() => handleReportAction(r.id, 'rejected')}
                                                            disabled={!!processingId}
                                                        >
                                                            <XCircle className="w-5 h-5" /> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100">
                                <CardContent className="p-24 text-center">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <ShieldCheck className="w-10 h-10 text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Queue is Empty</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto font-medium">No pending accident reports require moderation at this time.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Workshops Tab */}
                    <TabsContent value="workshops" className="space-y-6">
                        {loading ? (
                            <div className="grid grid-cols-1 gap-6">
                                {[1, 2].map(i => <div key={i} className="h-64 bg-white border border-slate-100 rounded-[32px] animate-pulse" />)}
                            </div>
                        ) : workshopRequests.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {workshopRequests.map((req) => (
                                    <Card key={req.id} className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row">
                                                <div className="w-full lg:w-96 aspect-video bg-slate-50 relative shrink-0">
                                                    {req.workshop_image ? (
                                                        <img src={req.workshop_image} alt="Workshop Storefront" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Wrench className="w-16 h-16" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-6 left-6">
                                                        <Badge className="bg-white/90 backdrop-blur-md text-emerald-700 border-0 rounded-lg px-3 py-1.5 font-bold text-xs shadow-xl uppercase tracking-widest">Workshop Application</Badge>
                                                    </div>
                                                </div>
                                                <div className="p-10 flex-1 flex flex-col justify-between">
                                                    <div className="space-y-6">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{req.workshop_name}</h3>
                                                                <div className="flex items-center gap-3 mt-2 text-indigo-600 font-bold">
                                                                    <Hash className="w-4 h-4" /> 
                                                                    <span className="uppercase tracking-widest text-sm">GST: {req.gst_number}</span>
                                                                </div>
                                                            </div>
                                                            <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-0 font-black text-[10px] uppercase px-2 py-1">Pending Review</Badge>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Owner Identity</label>
                                                                <p className="font-bold text-slate-700 flex items-center gap-2">
                                                                    {req.user_name || 'Owner Name'}
                                                                    <span className="text-xs text-slate-400 font-medium">({req.user_email})</span>
                                                                </p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Address</label>
                                                                <p className="font-bold text-slate-700 flex items-center gap-2">
                                                                    <MapPin className="w-4 h-4 text-slate-300" />
                                                                    {req.address}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-slate-50">
                                                        <Button 
                                                            className="flex-1 rounded-2xl h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-lg shadow-emerald-100 gap-3"
                                                            onClick={() => handleWorkshopAction(req.id, 'approved')}
                                                            disabled={!!processingId}
                                                        >
                                                            {processingId === req.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                                                            Approve Workshop Account
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            className="flex-1 rounded-2xl h-16 border-red-100 text-red-600 hover:bg-red-50 font-bold gap-3"
                                                            onClick={() => handleWorkshopAction(req.id, 'rejected')}
                                                            disabled={!!processingId}
                                                        >
                                                            <XCircle className="w-6 h-6" /> Decline Application
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100">
                                <CardContent className="p-24 text-center">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Wrench className="w-10 h-10 text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No Workshop Requests</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto font-medium">There are currently no pending workshop verification applications.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </FadeInView>
        </DashboardLayout>
    );
}

export default function ModerationPage() {
    return (
        <Suspense fallback={
            <DashboardLayout role={UserRole.ADMIN}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </DashboardLayout>
        }>
            <ModerationContent />
        </Suspense>
    );
}
