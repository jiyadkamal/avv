'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden relative">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm transition-all animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar
                role={role}
                className={cn(
                    "fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            />

            <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
                    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
