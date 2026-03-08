'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { Search, MapPin, Wrench, Loader2, ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FadeInView } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { STATES, getDistricts } from '@/lib/locations';

export default function WorkshopSearchPage() {
    const [searchName, setSearchName] = useState('');
    const [filterState, setFilterState] = useState('');
    const [filterDistrict, setFilterDistrict] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const districts = filterState && filterState !== 'all' ? getDistricts(filterState) : [];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        try {
            const params = new URLSearchParams();
            if (searchName.trim()) params.set('name', searchName.trim());
            if (filterState && filterState !== 'all') params.set('state', filterState);
            if (filterDistrict && filterDistrict !== 'all') params.set('district', filterDistrict);
            const res = await fetch(`/api/workshops?${params.toString()}`);
            const data = await res.json();
            setResults(data.workshops || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <DashboardLayout role={UserRole.SUBSCRIBER}>
            <FadeInView delay={0.1} className="space-y-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Find Workshops</h1>
                    <p className="text-slate-500 text-sm">Discover auto workshops near you by name or location.</p>
                </div>

                <form onSubmit={handleSearch} className="space-y-4 max-w-4xl">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Search by workshop name..." className="h-12 pl-10 rounded-xl bg-white border-slate-200 text-base shadow-sm" value={searchName} onChange={e => setSearchName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Select value={filterState} onValueChange={val => { setFilterState(val); setFilterDistrict(''); }}>
                            <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200"><SelectValue placeholder="Filter by State" /></SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 rounded-lg max-h-[300px]"><SelectItem value="all">All States</SelectItem>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={filterDistrict} onValueChange={val => setFilterDistrict(val)} disabled={!filterState || filterState === 'all'}>
                            <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200"><SelectValue placeholder="Filter by District" /></SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 rounded-lg max-h-[300px]"><SelectItem value="all">All Districts</SelectItem>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button type="submit" disabled={loading} className="h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 text-sm">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" />Search</>}
                        </Button>
                    </div>
                </form>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {results.map((w: any, i: number) => (
                            <FadeInView key={w.id} delay={0.1 + i * 0.05}>
                                <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all">
                                    {w.images?.length > 0 && (
                                        <div className="aspect-[16/9] overflow-hidden"><img src={w.images[0]} alt={w.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                                    )}
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0"><Wrench className="w-5 h-5 text-indigo-600" /></div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-slate-900 truncate">{w.name}</h3>
                                                    <div className="flex items-center gap-1.5 mt-0.5"><MapPin className="w-3 h-3 text-slate-400 shrink-0" /><p className="text-xs text-slate-500 truncate">{w.district}, {w.state}</p></div>
                                                </div>
                                            </div>
                                            {w.images?.length > 0 && <Badge variant="secondary" className="rounded-full text-xs border-0 bg-slate-100 text-slate-500 shrink-0">{w.images.length} photos</Badge>}
                                        </div>
                                        {w.description && <p className="text-sm text-slate-500 line-clamp-2 mt-3">{w.description}</p>}
                                    </CardContent>
                                </Card>
                            </FadeInView>
                        ))}
                    </div>
                ) : hasSearched ? (
                    <Card className="bg-white border-slate-200 rounded-xl"><CardContent className="p-16 text-center">
                        <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No workshops found</h3>
                        <p className="text-slate-500 text-sm">Try broadening your search filters.</p>
                    </CardContent></Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
                        {[
                            { label: 'Search by Name', desc: 'Enter the workshop name to find a specific shop.', icon: Search },
                            { label: 'Filter by Location', desc: 'Use state and district filters to find nearby shops.', icon: MapPin },
                            { label: 'View Details', desc: 'See shop photos, services, and location details.', icon: Wrench }
                        ].map((step) => (
                            <div key={step.label} className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mb-4 text-slate-400"><step.icon className="w-5 h-5" /></div>
                                <h4 className="font-semibold text-slate-900 mb-1 text-sm">{step.label}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
