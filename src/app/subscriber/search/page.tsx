'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { Search, Loader2, FileText, Car, Calendar, ChevronRight, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeInView } from '@/lib/animations';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoading(true);
        setHasSearched(true);
        try {
            const isVin = searchQuery.replace(/\s/g, '').length >= 10;
            const param = isVin ? `vin=${encodeURIComponent(searchQuery.trim())}` : `plate=${encodeURIComponent(searchQuery.trim())}`;
            const res = await fetch(`/api/reports?${param}&status=approved`);
            const data = await res.json();
            setResults(data.reports || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <DashboardLayout role={UserRole.SUBSCRIBER}>
            <FadeInView delay={0.1} className="space-y-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Vehicle Search</h1>
                    <p className="text-slate-500 text-sm">Search for accident history by VIN or license plate number.</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Enter VIN or license plate..."
                            className="h-12 pl-10 rounded-xl bg-white border-slate-200 text-base shadow-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" />Search</>}
                    </Button>
                </form>

                {loading ? (
                    <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                ) : results.length > 0 ? (
                    <div className="space-y-4">
                        {results.map((r: any) => (
                            <Link key={r.id} href={`/subscriber/reports/${r.id}`}>
                                <Card className="bg-white border-slate-200 shadow-sm rounded-xl hover:border-slate-300 hover:shadow-md transition-all cursor-pointer mb-4">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                                    <Car className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{r.vehicle_make} {r.vehicle_model}</h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">VIN: {r.vehicle_vin || 'N/A'} {r.vehicle_plate && `• Plate: ${r.vehicle_plate}`}</p>
                                                    {r.description && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{r.description}</p>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                {r.severity && <Badge className={cn("rounded-full font-medium text-xs border-0", r.severity === 'severe' ? 'bg-red-50 text-red-700' : r.severity === 'moderate' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')}>{r.severity}</Badge>}
                                                <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : hasSearched ? (
                    <Card className="bg-white border-slate-200 rounded-xl">
                        <CardContent className="p-16 text-center">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">No records found</h3>
                            <p className="text-slate-500 text-sm">No accident history found for this identifier.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
                        {[
                            { title: 'Search by VIN', desc: 'Enter a 17-digit Vehicle Identification Number for precise results.', icon: FileText },
                            { title: 'Search by Plate', desc: 'Use the license plate number to find associated records.', icon: Car },
                            { title: 'View Details', desc: 'See photos, severity, and full accident descriptions.', icon: AlertTriangle },
                        ].map((item) => (
                            <div key={item.title} className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mb-4 text-slate-400"><item.icon className="w-5 h-5" /></div>
                                <h4 className="font-semibold text-slate-900 mb-1 text-sm">{item.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
