'use client';

import { ChevronDown, LogOut, Menu, Car } from 'lucide-react';
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
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, setUser, setSession } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        router.push('/login');
    };

    return (
        <header className="h-20 border-b bg-card/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-xl"
                    onClick={onMenuClick}
                >
                    <Menu className="w-6 h-6" />
                </Button>

                <Link href="/" className="flex lg:hidden items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Car className="w-5 h-5 text-emerald-400" />
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <span className="text-xs md:text-sm font-medium text-muted-foreground capitalize hidden xs:block">
                    {user?.role}
                </span>

                <div className="h-6 w-[1px] bg-border hidden xs:block" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-auto p-1.5 md:p-2 rounded-xl hover:bg-accent flex items-center gap-2">
                            <span className="text-sm font-semibold max-w-[100px] md:max-w-none truncate">
                                {user?.full_name || 'Guest User'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl mt-2">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/settings">
                            <DropdownMenuItem className="rounded-lg cursor-pointer">Profile</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="rounded-lg">Billing</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg">Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="rounded-lg text-destructive focus:text-destructive cursor-pointer"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

