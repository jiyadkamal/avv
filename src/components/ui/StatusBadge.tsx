'use client';

import { cn } from '@/lib/utils';
import { ReportStatus } from '@/types';

interface StatusBadgeProps {
    status: ReportStatus;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const styles = {
        [ReportStatus.PENDING]: "bg-amber-50 text-amber-600 border-amber-100",
        [ReportStatus.APPROVED]: "bg-emerald-50 text-emerald-600 border-emerald-100",
        [ReportStatus.REJECTED]: "bg-rose-50 text-rose-600 border-rose-100",
    };

    const labels = {
        [ReportStatus.PENDING]: "Pending",
        [ReportStatus.APPROVED]: "Approved",
        [ReportStatus.REJECTED]: "Rejected",
    };

    return (
        <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            styles[status],
            className
        )}>
            {labels[status]}
        </span>
    );
}
