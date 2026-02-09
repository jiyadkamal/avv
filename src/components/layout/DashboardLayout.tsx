'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { UserRole } from '@/types';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar role={role} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
                    <div className="max-w-7xl mx-auto space-y-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
