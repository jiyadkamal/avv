'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ReportStatus } from '@/types';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

const mockReports = [
    {
        id: '1',
        vehicle: 'Toyota Camry (2020)',
        plate: 'ABC-1234',
        contributor: 'Jane Doe',
        date: 'Oct 24, 2023',
        status: ReportStatus.PENDING,
        avatar: '',
    },
    {
        id: '2',
        vehicle: 'Honda Civic (2018)',
        plate: 'XYZ-5678',
        contributor: 'John Smith',
        date: 'Oct 23, 2023',
        status: ReportStatus.APPROVED,
        avatar: '',
    },
    {
        id: '3',
        vehicle: 'Ford F-150 (2022)',
        plate: 'LMN-9012',
        contributor: 'Alice Johnson',
        date: 'Oct 22, 2023',
        status: ReportStatus.REJECTED,
        avatar: '',
    },
];

export function ModerationQueue() {
    return (
        <div className="rounded-3xl border-none shadow-sm bg-card overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
                <h3 className="font-bold text-lg">Moderation Queue</h3>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5">
                    View all queue
                </Button>
            </div>
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Vehicle</TableHead>
                        <TableHead className="py-4 font-bold text-xs uppercase tracking-wider">Contributor</TableHead>
                        <TableHead className="py-4 font-bold text-xs uppercase tracking-wider">Date</TableHead>
                        <TableHead className="py-4 font-bold text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="py-4 px-6 text-right font-bold text-xs uppercase tracking-wider">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockReports.map((report) => (
                        <TableRow key={report.id} className="hover:bg-muted/20 border-border/50 transition-colors">
                            <TableCell className="py-4 px-6">
                                <div>
                                    <p className="font-bold text-sm">{report.vehicle}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{report.plate}</p>
                                </div>
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={report.avatar} />
                                        <AvatarFallback className="text-[10px] font-bold bg-primary/5 text-primary">
                                            {report.contributor.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{report.contributor}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-4">
                                <span className="text-sm text-muted-foreground">{report.date}</span>
                            </TableCell>
                            <TableCell className="py-4">
                                <StatusBadge status={report.status} />
                            </TableCell>
                            <TableCell className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 hover:text-primary">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-emerald-50 hover:text-emerald-600">
                                        <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-rose-50 hover:text-rose-600">
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
