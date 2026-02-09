'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    FilePlus,
    Layers,
    Trophy,
    Search,
    Users,
    BarChart3,
    Settings,
    ShieldCheck,
    BookmarkCheck,
    CreditCard,
    MoreVertical,
    Car
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { useAuthStore } from '@/stores/authStore';

interface SidebarProps {
    role: UserRole;
    className?: string;
}

export function Sidebar({ role, className }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuthStore();

    const menuItems = {
        [UserRole.ADMIN]: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
            { label: 'Moderation', icon: ShieldCheck, href: '/admin/moderation' },
            { label: 'Users', icon: Users, href: '/admin/users' },
            { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
        ],
        [UserRole.CONTRIBUTOR]: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/contributor/dashboard' },
            { label: 'New Report', icon: FilePlus, href: '/contributor/upload' },
            { label: 'My Submissions', icon: Layers, href: '/contributor/reports' },
            { label: 'Rewards', icon: Trophy, href: '/contributor/wallet' },
        ],
        [UserRole.SUBSCRIBER]: [
            { label: 'Search', icon: Search, href: '/subscriber/search' },
            { label: 'Saved Reports', icon: BookmarkCheck, href: '/subscriber/saved' },
        ],
    };

    const items = menuItems[role] || [];

    // Get user initials
    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U';

    return (
        <aside className={cn(
            "flex flex-col w-64 bg-[#212f3d] text-slate-300 h-screen sticky top-0 border-none",
            className
        )}>
            {/* Logo */}
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Car className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="font-bold text-lg text-white tracking-tight">Vehicle Verify</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    // Exclude settings from main nav if it's supposed to be separate or handle it here
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-slate-700/50 text-white shadow-sm"
                                    : "text-slate-400 hover:bg-slate-700/30 hover:text-slate-200"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-white" : "text-slate-500 group-hover:text-slate-400"
                            )} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Settings */}
            <div className="mt-auto flex flex-col gap-2 px-3 pb-6">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                        pathname === "/settings"
                            ? "bg-slate-700/50 text-white"
                            : "text-slate-400 hover:bg-slate-700/30 hover:text-slate-200"
                    )}
                >
                    <Settings className="w-5 h-5 text-slate-500 group-hover:text-slate-400" />
                    Settings
                </Link>
            </div>
        </aside>
    );
}
