'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import {
    Search,
    Car,
    Calendar,
    AlertTriangle,
    ChevronRight,
    Loader2,
    Bookmark,
    BookmarkCheck,
    ArrowRight,
    Filter,
    List,
    LayoutGrid,
    History,
    FileSearch
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FadeInView } from '@/lib/animations';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Report {
    id: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_vin: string;
    vehicle_plate: string;
    severity: string;
    accident_date: string;
    created_at: string;
}

export default function SearchPage() {
    const { user } = useAuthStore();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [savedReportIds, setSavedReportIds] = useState<Set<string>>(new Set());
    const [savingId, setSavingId] = useState<string | null>(null);

    // Fetch user's saved report IDs on mount
    useEffect(() => {
        if (user?.id) {
            fetchSavedReportIds();
        }
    }, [user?.id]);

    const fetchSavedReportIds = async () => {
        const { data } = await supabase
            .from('saved_reports')
            .select('report_id')
            .eq('user_id', user?.id);

        if (data) {
            setSavedReportIds(new Set(data.map(d => d.report_id)));
        }
    };

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);

        const { data } = await supabase
            .from('reports')
            .select('*')
            .eq('status', 'approved')
            .or(`vehicle_vin.ilike.%${query}%,vehicle_plate.ilike.%${query}%,vehicle_make.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        setResults(data || []);
        setLoading(false);
    };

    const handleSaveToggle = async (reportId: string) => {
        if (!user?.id) return;

        setSavingId(reportId);
        const isSaved = savedReportIds.has(reportId);

        if (isSaved) {
            // Remove from saved
            await supabase
                .from('saved_reports')
                .delete()
                .eq('user_id', user.id)
                .eq('report_id', reportId);

            setSavedReportIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(reportId);
                return newSet;
            });
        } else {
            // Add to saved
            await supabase
                .from('saved_reports')
                .insert({ user_id: user.id, report_id: reportId });

            setSavedReportIds(prev => new Set(prev).add(reportId));
        }

        setSavingId(null);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case 'minor': return 'bg-yellow-100 text-yellow-700';
            case 'moderate': return 'bg-orange-100 text-orange-700';
            case 'severe': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <DashboardLayout role={UserRole.SUBSCRIBER}>
            <FadeInView delay={0.1} className="space-y-12 pb-12">
                {/* Hero Search Section */}
                <div className="flex justify-center pt-2 md:pt-6">
                    <Card className="w-full max-w-5xl border-none shadow-[0_4px_25px_rgba(0,0,0,0.04)] rounded-[24px] md:rounded-[40px] bg-white overflow-hidden p-6 md:p-10 text-center space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900">Search Vehicles</h1>
                            <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
                                Search by VIN, license plate, or make to find accident reports.
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto relative group flex flex-col md:block gap-3">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-slate-400" />
                                </div>
                                <Input
                                    placeholder="Enter VIN, plate, or make..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="h-14 pl-16 pr-6 md:pr-44 rounded-2xl bg-slate-50 border-transparent text-lg focus-visible:ring-primary focus-visible:bg-white transition-all shadow-inner w-full"
                                />
                            </div>
                            <div className="md:absolute md:inset-y-2 md:right-2 flex items-center w-full md:w-auto">
                                <Button
                                    onClick={handleSearch}
                                    disabled={loading || !query.trim()}
                                    className="h-12 md:h-10 px-8 rounded-xl font-bold gap-2 bg-[#2563eb] hover:bg-blue-700 shadow-md group w-full md:w-auto"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Search
                                            <ArrowRight className="w-4 h-4 transition-transform md:group-hover:translate-x-1" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Results Section */}
                <div className="max-w-4xl mx-auto space-y-6">
                    {searched && (
                        <FadeInView delay={0.1}>
                            <div className="flex items-center justify-between mb-8 px-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                                        <div className="w-3 h-3 border-2 border-white rounded-sm" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {results.length} {results.length === 1 ? 'Result' : 'Results'} Found
                                    </h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                                        <List className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                                        <Filter className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-32 bg-white rounded-3xl animate-pulse shadow-sm" />
                                    ))}
                                </div>
                            ) : results.length > 0 ? (
                                <div className="space-y-4">
                                    {results.map((report) => {
                                        const isSaved = savedReportIds.has(report.id);
                                        return (
                                            <Card
                                                key={report.id}
                                                className="border-none shadow-sm rounded-[24px] md:rounded-[32px] bg-white hover:shadow-md transition-all group overflow-hidden"
                                            >
                                                <CardContent className="p-6 md:p-8">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-4 md:gap-6 flex-1 min-w-0">
                                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[16px] md:rounded-[20px] bg-blue-50 flex items-center justify-center shadow-sm shrink-0">
                                                                <Car className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                                                            </div>
                                                            <div className="space-y-1 md:space-y-1.5 min-w-0 w-full">
                                                                <p className="text-lg md:text-xl font-bold text-slate-900 truncate">
                                                                    {new Date(report.accident_date).getFullYear()} {report.vehicle_make} {report.vehicle_model}
                                                                </p>
                                                                <div className="flex flex-col gap-1 text-[11px] md:text-[13px] font-medium uppercase tracking-tight text-slate-400">
                                                                    <p className="truncate">VIN: <span className="text-slate-600 font-mono tracking-normal">{report.vehicle_vin || 'N/A'}</span></p>
                                                                    <p className="truncate">Plate: <span className="text-slate-600 font-mono tracking-normal">{report.vehicle_plate || 'NOT SET'}</span></p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col sm:flex-row md:items-center gap-4 md:gap-5 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                                                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                                                <div className="bg-orange-50 text-orange-600 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-[11px] font-extrabold flex items-center gap-2 border border-orange-100 shadow-sm uppercase tracking-wide">
                                                                    <AlertTriangle className="w-3 h-3 fill-orange-500 text-orange-50" />
                                                                    Accident Found
                                                                </div>

                                                                <div className="bg-slate-50 text-slate-500 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-[11px] font-bold flex items-center gap-2 border border-slate-100 uppercase tracking-wide">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    {new Date(report.accident_date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                                </div>
                                                            </div>

                                                            <div className="hidden md:block h-8 w-[1px] bg-slate-100 mx-1" />

                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={cn(
                                                                        "rounded-xl h-10 w-10 md:h-11 md:w-11 transition-colors",
                                                                        isSaved ? "bg-primary/5 text-primary" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                                                    )}
                                                                    onClick={() => handleSaveToggle(report.id)}
                                                                    disabled={savingId === report.id}
                                                                >
                                                                    {savingId === report.id ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : isSaved ? (
                                                                        <BookmarkCheck className="w-5 h-5 fill-primary" />
                                                                    ) : (
                                                                        <Bookmark className="w-5 h-5" />
                                                                    )}
                                                                </Button>

                                                                <Link href={`/subscriber/reports/${report.id}`} className="flex-1">
                                                                    <Button variant="ghost" className="rounded-xl h-10 md:h-11 font-bold text-primary gap-1 px-4 hover:bg-primary/5 w-full justify-center">
                                                                        View Report
                                                                        <ChevronRight className="w-4 h-4 ml-1" />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Card className="border-none shadow-sm rounded-[32px] bg-slate-50/50">
                                    <CardContent className="p-16 text-center">
                                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                                            <Search className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900 mb-2">No Results Found</p>
                                        <p className="text-slate-400 text-lg max-w-md mx-auto">
                                            Try searching with a different VIN, plate, or vehicle make.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </FadeInView>
                    )}



                </div>
            </FadeInView>
        </DashboardLayout>
    );
}
