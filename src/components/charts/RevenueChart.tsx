'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

const data = [
    { name: 'Jan', new: 400, returning: 240 },
    { name: 'Feb', new: 300, returning: 139 },
    { name: 'Mar', new: 200, returning: 980 },
    { name: 'Apr', new: 278, returning: 390 },
    { name: 'May', new: 189, returning: 480 },
    { name: 'Jun', new: 239, returning: 380 },
    { name: 'Jul', new: 349, returning: 430 },
    { name: 'Aug', new: 400, returning: 240 },
    { name: 'Sep', new: 300, returning: 139 },
    { name: 'Oct', new: 200, returning: 980 },
    { name: 'Nov', new: 278, returning: 390 },
    { name: 'Dec', new: 189, returning: 480 },
];

export function RevenueChart() {
    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    barGap={8}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: '#F1F5F9', radius: 8 }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="new" fill="#0066FF" radius={[6, 6, 0, 0]} barSize={12} />
                    <Bar dataKey="returning" fill="#E2E8F0" radius={[6, 6, 0, 0]} barSize={12} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
