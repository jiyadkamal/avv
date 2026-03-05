'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import {
    FileText, Calendar, Trash2, Loader2, Car
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

interface SavedReport {
    id: string;
    report_id: string;
    created_at: string;
    reports: {
        id: string;
        vehicle_make: string;
        vehicle_model: string;
        vehicle_vin: string;
        status: string;
        created_at: string;
    };
}

export default function SavedReportsPage() {
    const { user } = useAuthStore();
    const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchSavedReports();
        }
    }, [user?.id]);

    const fetchSavedReports = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('saved_reports')
            .select(`
                id,
                report_id,
                created_at,
                reports (
                    id,
                    vehicle_make,
                    vehicle_model,
                    vehicle_vin,
                    status,
                    created_at
                )
            `)
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setSavedReports(data as unknown as SavedReport[]);
        }
        setLoading(false);
    };

    const handleRemove = async (savedReportId: string) => {
        setRemoving(savedReportId);
        const { error } = await supabase
            .from('saved_reports')
            .delete()
            .eq('id', savedReportId);

        if (!error) {
            setSavedReports(prev => prev.filter(r => r.id !== savedReportId));
        }
        setRemoving(null);
    };

    return (
        <DashboardLayout role={UserRole.SUBSCRIBER}>
            <FadeInView delay={0.1} className="space-y-8">
                <div className="flex flex-col gap-1 px-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Saved Reports</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Vehicle reports you've saved for reference.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : savedReports.length > 0 ? (
                    <div className="space-y-4">
                        {savedReports.map((saved, index) => (
                            <FadeInView key={saved.id} delay={0.1 + index * 0.05}>
                                <Card className="border-none shadow-sm rounded-[24px] overflow-hidden hover:shadow-md transition-shadow group">
                                    <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Car className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-base md:text-lg truncate">
                                                    {saved.reports?.vehicle_make} {saved.reports?.vehicle_model}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        VIN: {saved.reports?.vehicle_vin || 'N/A'}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(saved.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                                            <Badge variant="secondary" className="rounded-lg px-3 py-1 capitalize text-[10px] md:text-xs">
                                                {saved.reports?.status}
                                            </Badge>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/subscriber/reports/${saved.report_id}`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-xl font-bold text-xs h-9"
                                                    >
                                                        View Report
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                                    onClick={() => handleRemove(saved.id)}
                                                    disabled={removing === saved.id}
                                                >
                                                    {removing === saved.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </FadeInView>
                        ))}
                    </div>
                ) : (
                    <Card className="border-none shadow-lg rounded-2xl">
                        <CardContent className="p-12 text-center">
                            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No Saved Reports</h3>
                            <p className="text-muted-foreground mb-4">
                                Search for vehicles and save reports for easy access later.
                            </p>
                            <Link href="/subscriber/search">
                                <Button className="rounded-xl">Search Vehicles</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
