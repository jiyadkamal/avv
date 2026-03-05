'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { FileText, Calendar, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeInView } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface Report {
    id: string;
    vehicle_vin: string;
    vehicle_make: string;
    vehicle_model: string;
    status: string;
    created_at: string;
}

export default function ContributorReportsPage() {
    const { user } = useAuthStore();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReports() {
            if (!user?.id) return;

            const { data, error } = await supabase
                .from('reports')
                .select('id, vehicle_vin, vehicle_make, vehicle_model, status, created_at')
                .eq('contributor_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setReports(data);
            }
            setLoading(false);
        }
        fetchReports();
    }, [user?.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-500/10 text-green-500';
            case 'rejected': return 'bg-red-500/10 text-red-500';
            default: return 'bg-yellow-500/10 text-yellow-500';
        }
    };

    return (
        <DashboardLayout role={UserRole.CONTRIBUTOR}>
            <FadeInView delay={0.1} className="space-y-8">
                <div className="px-1">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">My Reports</h1>
                    <p className="text-sm md:text-base text-muted-foreground">View and track all your submitted accident reports.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="border-none shadow-lg rounded-2xl animate-pulse">
                                <CardContent className="p-6 h-24 bg-muted/20" />
                            </Card>
                        ))}
                    </div>
                ) : reports.length > 0 ? (
                    <div className="space-y-4">
                        {reports.map((report, index) => (
                            <FadeInView key={report.id} delay={0.1 + index * 0.05}>
                                <Link href={`/contributor/reports/${report.id}`}>
                                    <Card className="border-none shadow-sm rounded-2xl md:rounded-3xl overflow-hidden hover:shadow-md transition-all active:scale-[0.98]">
                                        <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                                    <FileText className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-base md:text-lg truncate">
                                                        {report.vehicle_make} {report.vehicle_model}
                                                    </p>
                                                    <p className="text-xs md:text-sm text-muted-foreground truncate uppercase tracking-wider font-medium">VIN: {report.vehicle_vin}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
                                                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-tight">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(report.created_at).toLocaleDateString('en-GB')}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={cn("rounded-full px-3 md:px-4 py-0.5 md:py-1 font-bold text-[10px] md:text-xs shadow-none border-none", getStatusColor(report.status))}>
                                                        {report.status}
                                                    </Badge>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </FadeInView>
                        ))}
                    </div>
                ) : (
                    <Card className="border-none shadow-lg rounded-2xl">
                        <CardContent className="p-12 text-center">
                            <AlertCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No Reports Yet</h3>
                            <p className="text-muted-foreground">Start contributing by submitting your first accident report.</p>
                        </CardContent>
                    </Card>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
