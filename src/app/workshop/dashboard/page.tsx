'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { Wrench, MapPin, ImageIcon, Plus, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function WorkshopDashboard() {
    const { user } = useAuthStore();
    const [workshop, setWorkshop] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWorkshop() {
            if (!user?.id) { setLoading(false); return; }
            try { const res = await fetch(`/api/workshops?owner_id=${user.id}`); const data = await res.json(); if (data.workshops?.length > 0) setWorkshop(data.workshops[0]); }
            catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchWorkshop();
    }, [user?.id]);

    return (
        <DashboardLayout role={UserRole.WORKSHOP}>
            <FadeInView delay={0.1} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Workshop Dashboard</h1>
                        <p className="text-slate-500 text-sm">Manage your workshop listing and visibility.</p>
                    </div>
                    <Link href="/workshop/listing">
                        <Button className="rounded-lg h-10 px-5 font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm">
                            {workshop ? <><Edit className="w-4 h-4" />Edit Listing</> : <><Plus className="w-4 h-4" />Create Listing</>}
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                ) : workshop ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {[
                                { label: 'Workshop Name', value: workshop.name, icon: Wrench, color: 'bg-indigo-50 text-indigo-600' },
                                { label: workshop.state, value: workshop.district, icon: MapPin, color: 'bg-violet-50 text-violet-600' },
                                { label: 'Shop Images', value: workshop.images?.length || 0, icon: ImageIcon, color: 'bg-blue-50 text-blue-600' },
                            ].map((stat, i) => (
                                <FadeInView key={i} delay={0.1 + i * 0.05}>
                                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color)}><stat.icon className="w-5 h-5" /></div>
                                                {i === 0 && <Badge className="bg-emerald-50 text-emerald-700 border-0 rounded-full text-xs font-medium">Active</Badge>}
                                            </div>
                                            <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
                                        </CardContent>
                                    </Card>
                                </FadeInView>
                            ))}
                        </div>

                        {workshop.images?.length > 0 && (
                            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                                <CardHeader className="px-6 py-5 pb-3"><CardTitle className="text-lg font-semibold text-slate-900">Shop Gallery</CardTitle></CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {workshop.images.map((img: string, i: number) => (
                                            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200">
                                                <img src={img} alt={`Shop ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {workshop.description && (
                            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                                <CardHeader className="px-6 py-5 pb-3"><CardTitle className="text-lg font-semibold text-slate-900">Description</CardTitle></CardHeader>
                                <CardContent className="px-6 pb-6"><p className="text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-lg border border-slate-100">{workshop.description}</p></CardContent>
                            </Card>
                        )}
                    </>
                ) : (
                    <Card className="bg-white border-slate-200 rounded-xl border-dashed">
                        <CardContent className="p-16 text-center">
                            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Listing Yet</h3>
                            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Create your workshop listing to be discovered by vehicle owners.</p>
                            <Link href="/workshop/listing"><Button className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold gap-2"><Plus className="w-4 h-4" />Create Workshop Listing</Button></Link>
                        </CardContent>
                    </Card>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
