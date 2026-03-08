'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { BookmarkCheck, Trash2, Car, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SavedReportsPage() {
    const [saved, setSaved] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSaved() {
            try { const res = await fetch('/api/saved-reports'); const data = await res.json(); setSaved(data.savedReports || []); }
            catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchSaved();
    }, []);

    const handleRemove = async (id: string) => {
        try { const res = await fetch(`/api/saved-reports?report_id=${id}`, { method: 'DELETE' }); if (res.ok) { setSaved(prev => prev.filter(r => r.id !== id)); toast.success('Removed from saved'); } }
        catch { toast.error('Failed to remove'); }
    };

    return (
        <DashboardLayout role={UserRole.SUBSCRIBER}>
            <FadeInView delay={0.1} className="space-y-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Saved Reports</h1>
                    <p className="text-slate-500 text-sm">Your bookmarked vehicle reports for quick access.</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                ) : saved.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {saved.map((r: any) => (
                            <Card key={r.id} className="bg-white border-slate-200 shadow-sm rounded-xl hover:border-slate-300 transition-all">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                                <Car className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900 truncate">{r.vehicle_make} {r.vehicle_model}</p>
                                                <p className="text-xs text-slate-500">VIN: ...{r.vehicle_vin?.slice(-6) || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <Link href={`/subscriber/reports/${r.report_id || r.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-indigo-50 text-indigo-600"><ExternalLink className="w-4 h-4" /></Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-500" onClick={() => handleRemove(r.id)}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-white border-slate-200 rounded-xl">
                        <CardContent className="p-16 text-center">
                            <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">No saved reports</h3>
                            <p className="text-slate-500 text-sm mb-4">Save reports from search results for quick reference.</p>
                            <Link href="/subscriber/search"><Button className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium">Search Vehicles</Button></Link>
                        </CardContent>
                    </Card>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
