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
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Reports</h1>
                    <p className="text-muted-foreground">View and track all your submitted accident reports.</p>
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
                                <Card className="border-none shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
                                    <CardContent className="p-6 flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <FileText className="w-7 h-7 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-lg">
                                                {report.vehicle_make} {report.vehicle_model}
                                            </p>
                                            <p className="text-sm text-muted-foreground">VIN: {report.vehicle_vin}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </div>
                                        <Badge className={`rounded-full px-4 py-1 ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </Badge>
                                        <Link href={`/contributor/reports/${report.id}`}>
                                            <Button variant="ghost" size="sm" className="rounded-xl">
                                                View <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
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
