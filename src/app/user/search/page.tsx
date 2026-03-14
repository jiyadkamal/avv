'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole, AccountTier } from '@/types';
import { 
    Search, Loader2, FileText, Car, ChevronRight, 
    AlertTriangle, ShieldCheck, Zap, Lock, MapPin, Wrench 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SearchPage() {
    const { user } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const isLocked = user?.account_tier === AccountTier.FREE;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked || !searchQuery.trim()) return;
        
        setLoading(true);
        setHasSearched(true);
        try {
            const isVin = searchQuery.replace(/\s/g, '').length >= 10;
            const param = isVin 
                ? `vin=${encodeURIComponent(searchQuery.trim())}` 
                : `plate=${encodeURIComponent(searchQuery.trim())}`;
            
            const res = await fetch(`/api/reports?${param}&status=approved`);
            const data = await res.json();
            setResults(data.reports || []);
        } catch (e) { 
            console.error(e); 
        }
        setLoading(false);
    };

    if (!user) return null;

    return (
        <DashboardLayout role={UserRole.USER}>
            <FadeInView delay={0.1} className="space-y-8 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Vehicle Search</h1>
                    <p className="text-slate-500">Search for accident history and verification records.</p>
                </div>

                {isLocked ? (
                    <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white border border-slate-100">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-center relative overflow-hidden">
                            {/* Abstract background shapes */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl" />
                            
                            <div className="relative z-10 flex flex-col items-center gap-6">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                                    <Lock className="w-10 h-10 text-white" />
                                </div>
                                <div className="space-y-3 max-w-md">
                                    <h2 className="text-3xl font-bold text-white">Search is Locked</h2>
                                    <p className="text-indigo-100/80 leading-relaxed font-medium">
                                        Vehicle history search and verification features are only available for Premium and Pro members.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                    <Link href="/user/upgrade">
                                        <Button className="h-14 px-8 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold text-lg shadow-lg active:scale-95 transition-all">
                                            Upgrade Now <Zap className="w-5 h-5 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                                <div className="flex gap-8 mt-4">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Verified History</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/60">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Insurance Data</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-12 grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50/50">
                            {[
                                { title: 'VIN Decode', desc: 'Get manufacturer details and specs from any valid VIN.', icon: FileText },
                                { title: 'Accident History', desc: 'View reported collisions, severity, and repair status.', icon: Car },
                                { title: 'Workshop Analysis', desc: 'Access professional damage assessments and service logs.', icon: Wrench },
                            ].map((item) => (
                                <div key={item.title} className="text-center space-y-3">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                                        <item.icon className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card className="border-none shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                            <CardContent className="p-1">
                                <form onSubmit={handleSearch} className="flex gap-2 p-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            placeholder="Enter VIN or license plate..."
                                            className="h-16 pl-14 pr-6 rounded-[20px] bg-slate-50 border-none text-lg font-medium focus-visible:ring-indigo-600 shadow-inner"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" disabled={loading} className="h-16 px-10 rounded-[20px] bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg gap-3 shadow-lg shadow-indigo-200">
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Search className="w-6 h-6" />Search</>}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-40 bg-white border border-slate-100 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : results.length > 0 ? (
                            <div className="space-y-6">
                                {results.map((report) => (
                                    <Link key={report.id} href={`/user/reports/${report.id}`}>
                                        <Card className="bg-white border border-slate-100 shadow-sm rounded-3xl hover:border-indigo-200 hover:shadow-md transition-all group overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="flex flex-col md:flex-row">
                                                    <div className="w-full md:w-48 aspect-video md:aspect-square bg-slate-50 relative shrink-0">
                                                        {report.images?.[0] ? (
                                                            <img src={report.images[0]} alt="Vehicle" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <Car className="w-12 h-12" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 left-4">
                                                            <Badge className={cn(
                                                                "rounded-lg px-2 py-1 font-bold text-[10px] uppercase border-0",
                                                                report.severity === 'severe' ? 'bg-red-500 text-white' : 
                                                                report.severity === 'moderate' ? 'bg-amber-500 text-white' : 
                                                                'bg-emerald-500 text-white'
                                                            )}>
                                                                {report.severity}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="p-8 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                                <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                                                                    {report.vehicle_make} {report.vehicle_model}
                                                                </h3>
                                                                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0" />
                                                            </div>
                                                                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                                        <span className="text-slate-300">VIN</span> {report.vehicle_vin || 'N/A'}
                                                                    </p>
                                                                    {report.vehicle_plate && (
                                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                                            <span className="text-slate-300">Plate</span> {report.vehicle_plate}
                                                                        </p>
                                                                    )}
                                                                    {report.address && (
                                                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-tight">
                                                                            <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                                                            <span className="truncate max-w-[200px]">{report.address}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            {report.description && (
                                                                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed italic">
                                                                    "{report.description}"
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                                                            <div className="flex items-center gap-4 text-xs font-bold">
                                                                <span className="text-slate-400">{new Date(report.created_at).toLocaleDateString()}</span>
                                                                {report.is_workshop_report && (
                                                                    <div className="flex items-center gap-1.5 text-emerald-600">
                                                                        <ShieldCheck className="w-4 h-4" />
                                                                        Workshop Verified
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <Button variant="ghost" className="text-indigo-600 font-extrabold text-xs uppercase p-0 h-auto hover:bg-transparent">
                                                                View Full History
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : hasSearched ? (
                            <div className="text-center py-24 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No Records Found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">
                                    We couldn't find any verified accident history for this VIN/Plate in our database.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { title: 'Search by VIN', desc: '17-digit identifier for precise factory records.', icon: FileText, color: 'text-indigo-500' },
                                    { title: 'Search by Plate', desc: 'Fast identification using regional registration numbers.', icon: Car, color: 'text-violet-500' },
                                    { title: 'Verified Accuracy', desc: 'Every report is vetted by our moderation team.', icon: ShieldCheck, color: 'text-emerald-500' },
                                ].map((item) => (
                                    <div key={item.title} className="p-8 bg-white rounded-3xl border border-slate-50 shadow-sm space-y-4">
                                        <div className={cn("w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center", item.color)}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-bold text-slate-900">{item.title}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
