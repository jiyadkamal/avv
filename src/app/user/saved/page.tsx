'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { 
    BookmarkCheck, Trash2, Car, ExternalLink, 
    Loader2, Search, ChevronRight, Bookmark
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SavedReportsPage() {
    const [saved, setSaved] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSaved() {
            try { 
                const res = await fetch('/api/saved-reports'); 
                const data = await res.json(); 
                setSaved(data.savedReports || []); 
            }
            catch (e) { 
                console.error(e); 
            }
            setLoading(false);
        }
        fetchSaved();
    }, []);

    const handleRemove = async (reportId: string) => {
        try { 
            const res = await fetch('/api/saved-reports', { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ report_id: reportId })
            }); 
            if (res.ok) { 
                setSaved(prev => prev.filter(r => r.report_id !== reportId)); 
                toast.success('Removed from saved'); 
            } 
        }
        catch { 
            toast.error('Failed to remove'); 
        }
    };

    return (
        <DashboardLayout role={UserRole.USER}>
            <FadeInView delay={0.1} className="space-y-8 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">Saved Reports</h1>
                        <p className="text-slate-500">Your collection of bookmarked vehicle reports.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white border border-slate-100 rounded-3xl animate-pulse" />)}
                    </div>
                ) : saved.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {saved.map((r, i) => (
                            <FadeInView key={r.id} delay={0.1 + i * 0.05}>
                                <Card className="bg-white border-slate-100 shadow-sm rounded-3xl hover:border-indigo-200 hover:shadow-md transition-all group overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-6">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                    <Car className="w-7 h-7" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-lg font-bold text-slate-900 truncate mb-1">
                                                        {r.report.vehicle_make} {r.report.vehicle_model}
                                                    </h3>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                        <span className="opacity-50 mr-1">VIN</span> ...{r.report.vehicle_vin?.slice(-8) || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <Link href={`/user/reports/${r.report_id || r.id}`}>
                                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-100 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 shadow-sm">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50" 
                                                    onClick={() => handleRemove(r.report_id)}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </FadeInView>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-white border-slate-100 rounded-[32px] border-2 border-dashed shadow-none">
                        <CardContent className="p-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bookmark className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No saved reports</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
                                Bookmark reports during your vehicle search to access them quickly from here later.
                            </p>
                            <Link href="/user/search">
                                <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg shadow-xl shadow-indigo-100">
                                    <Search className="w-5 h-5 mr-3" /> Start Searching
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
