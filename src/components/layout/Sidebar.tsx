'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, FilePlus, Layers, Trophy, Search,
    Users, BarChart3, Settings, ShieldCheck, BookmarkCheck,
    Car, Wrench, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole, AccountTier } from '@/types';
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
        [UserRole.USER]: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/user/dashboard' },
            { label: 'New Report', icon: FilePlus, href: '/user/upload' },
            { label: 'My Reports', icon: Layers, href: '/user/reports' },
            { label: 'Rewards', icon: Trophy, href: '/user/wallet' },
            // Tier-gated search
            ...(user?.account_tier !== AccountTier.FREE 
                ? [{ label: 'Search', icon: Search, href: '/user/search' }]
                : [{ label: 'Upgrade to Search', icon: Zap, href: '/user/upgrade', highlight: true }]
            ),
            { label: 'Saved Reports', icon: BookmarkCheck, href: '/user/saved' },
            // Workshop specific (or application link)
            ...(user?.is_workshop 
                ? []
                : [{ label: 'Workshop Account', icon: Wrench, href: '/user/workshop-apply' }]
            ),
        ],
    };

    const items = menuItems[role] || [];

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U';

    return (
        <aside className={cn(
            "flex flex-col w-64 bg-white text-slate-600 min-h-screen h-full border-r border-slate-200",
            className
        )}>
            {/* Logo */}
            <div className="p-6 md:p-8 mb-2">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Car className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Vehicle<span className="text-indigo-600">Verify</span></span>
                </Link>
            </div>

            {/* Role/Tier badge */}
            <div className="px-6 mb-4">
                <div className={cn(
                    "px-3 py-1.5 rounded-lg border",
                    role === UserRole.ADMIN 
                        ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-100/60" 
                        : "bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100/60"
                )}>
                    <p className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        role === UserRole.ADMIN ? "text-red-600" : "text-indigo-600"
                    )}>
                        {role === UserRole.ADMIN ? 'Administrator' : `${user?.account_tier || 'Free'} Member`}
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-1">
                {items.map((item: any) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative group",
                                isActive
                                    ? "bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 font-semibold border border-indigo-100/60"
                                    : item.highlight 
                                        ? "text-indigo-600 hover:bg-indigo-50" 
                                        : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn(
                                "w-[18px] h-[18px] transition-colors",
                                isActive || item.highlight ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            {item.label}
                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-indigo-600" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User card + Settings */}
            <div className="mt-auto px-4 pb-6 space-y-3">
                <div className="border-t border-slate-100 pt-4">
                    <Link
                        href="/settings"
                        className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                            pathname === "/settings"
                                ? "bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-100/60"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <Settings className="w-[18px] h-[18px]" />
                        Settings
                    </Link>
                </div>

                {/* User mini card */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl px-4 py-3 border border-slate-200/60">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name || 'Guest'}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
