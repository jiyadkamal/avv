'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { Search, BookmarkCheck, Car, ChevronRight, Clock, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

export default function SubscriberDashboard() {
    const { user } = useAuthStore();
    const [savedCount, setSavedCount] = useState(0);
    const [recentReports, setRecentReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user?.id) { setLoading(false); return; }
            try {
                const [reportsRes, savedRes] = await Promise.all([
                    fetch('/api/reports?status=approved&limit=4'),
                    fetch('/api/saved-reports'),
                ]);
                const reportsData = await reportsRes.json();
                const savedData = await savedRes.json();
                setRecentReports(reportsData.reports || []);
                setSavedCount((savedData.savedReports || []).length);
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchData();
    }, [user?.id]);

    return (
        <DashboardLayout role={UserRole.SUBSCRIBER}>
            <FadeInView delay={0.1} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight mb-1">Subscriber Dashboard</h1><p className="text-muted-foreground">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}. Search vehicle history and access reports.</p></div><Link href="/subscriber/search"><Button className="rounded-2xl h-12 px-6 font-bold gap-2"><Search className="w-4 h-4" />Search Vehicles</Button></Link></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><FadeInView delay={0.15}><Link href="/subscriber/saved"><Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl cursor-pointer"><CardContent className="p-6"><div className="flex items-start justify-between mb-4"><div className="p-3 rounded-xl bg-purple-500/10 text-purple-600"><BookmarkCheck className="w-5 h-5" /></div></div><p className="text-3xl font-bold mb-1">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : savedCount.toLocaleString()}</p><p className="text-sm text-muted-foreground font-medium">Saved Reports</p></CardContent></Card></Link></FadeInView></div>
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden"><div className="bg-gradient-to-r from-muted/50 to-muted p-6 md:p-8"><div className="max-w-xl"><h2 className="text-xl md:text-2xl font-bold mb-2">Search Vehicle History</h2><p className="text-sm md:text-base text-muted-foreground mb-6">Enter a VIN or license plate to access comprehensive accident reports.</p><Link href="/subscriber/search"><Button size="lg" className="rounded-2xl h-12 px-6 md:px-8 font-bold gap-2 w-full md:w-auto"><Search className="w-5 h-5" />Start Searching</Button></Link></div></div></Card>
                <Card className="border-none shadow-sm rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between p-6 pb-4"><CardTitle className="text-lg font-bold">Recently Added Reports</CardTitle><Link href="/subscriber/search"><Button variant="ghost" size="sm" className="rounded-xl text-primary font-semibold gap-1">View All<ChevronRight className="w-4 h-4" /></Button></Link></CardHeader>
                    <CardContent className="p-6 pt-0">
                        {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted/30 rounded-xl animate-pulse" />)}</div>
                            : recentReports.length > 0 ? <div className="space-y-3">{recentReports.map((r: any) => (<Link key={r.id} href={`/subscriber/reports/${r.id}`}><div className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer gap-2"><div className="flex items-center gap-3 md:gap-4 min-w-0"><div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Car className="w-5 h-5 md:w-6 md:h-6 text-primary" /></div><div className="min-w-0"><p className="font-bold truncate text-sm md:text-base">{r.vehicle_make} {r.vehicle_model}</p><p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5"><Clock className="w-3 h-3" /><span className="truncate">{new Date(r.created_at).toLocaleDateString()}</span></p></div></div><ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" /></div></Link>))}</div>
                                : <div className="text-center py-12"><FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No reports available yet.</p></div>}
                    </CardContent>
                </Card>
            </FadeInView>
        </DashboardLayout>
    );
}
