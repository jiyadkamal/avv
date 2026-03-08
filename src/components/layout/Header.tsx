'use client';

import { ChevronDown, LogOut, Menu, Car, Bell } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, setUser, setSession } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        setSession(null);
        router.push('/login');
    };

    return (
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="lg:hidden rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={onMenuClick}>
                    <Menu className="w-5 h-5" />
                </Button>
                <Link href="/" className="flex lg:hidden items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
                        <Car className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-base tracking-tight">Vehicle<span className="text-indigo-600">Verify</span></span>
                </Link>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
                {/* Notification bell */}
                <Button variant="ghost" size="icon" className="rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 relative">
                    <Bell className="w-[18px] h-[18px]" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
                </Button>
                <div className="h-5 w-px bg-slate-200 hidden md:block" />
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-semibold text-indigo-600 capitalize">{user?.role}</span>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[160px]">{user?.full_name || 'Guest User'}</span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-auto p-1 rounded-lg hover:bg-slate-100 flex items-center gap-2 group transition-all">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-indigo-500/20">
                                {user?.full_name?.[0] || 'U'}
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-xl mt-2 bg-white border-slate-200 p-1.5 shadow-xl">
                        <DropdownMenuLabel className="text-slate-500 text-xs font-semibold px-3 py-2">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <Link href="/settings"><DropdownMenuItem className="rounded-lg cursor-pointer py-2.5 px-3 text-sm">Account Settings</DropdownMenuItem></Link>
                        <DropdownMenuItem className="rounded-lg py-2.5 px-3 text-sm">Support</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem className="rounded-lg py-2.5 px-3 text-sm text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer font-medium" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
