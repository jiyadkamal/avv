'use client';

import { ArrowUpRight, ArrowDownRight, Users, ShieldCheck, FileText, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
    title: string;
    value: string | number;
    description: string;
    trend?: number; // percentage
    icon: any;
    className?: string;
    color?: 'blue' | 'green' | 'red' | 'yellow';
}

export function KPICard({
    title,
    value,
    description,
    trend,
    icon: Icon,
    className,
    color = 'blue'
}: KPICardProps) {
    const isPositive = trend && trend > 0;

    const colorClasses = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        green: "text-emerald-600 bg-emerald-50 border-emerald-100",
        red: "text-rose-600 bg-rose-50 border-rose-100",
        yellow: "text-amber-600 bg-amber-50 border-amber-100",
    };

    return (
        <Card className={cn("border-none shadow-sm rounded-3xl overflow-hidden", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-2.5 rounded-2xl border", colorClasses[color])}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {trend !== undefined && (
                        <div className={cn(
                            "flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full",
                            isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                        )}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
