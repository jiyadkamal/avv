'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole, AccountTier, WorkshopStatus } from '@/types';
import { 
    Users, Search, Mail, Calendar, 
    ShieldCheck, Zap, Wrench, MoreVertical,
    User as UserIcon, ShieldAlert
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FadeInView } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchUsers() {
            try { 
                const res = await fetch('/api/users'); 
                const data = await res.json(); 
                setUsers(data.users || []); 
            }
            catch (e) { 
                console.error(e); 
                toast.error('Failed to load users');
            }
            setLoading(false);
        }
        fetchUsers();
    }, []);

    const handleUpdateTier = async (userId: string, tier: AccountTier) => {
        try {
            const res = await fetch(`/api/users/${userId}/tier`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier })
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, account_tier: tier } : u));
                toast.success(`User updated to ${tier.toUpperCase()}`);
            }
        } catch (e) {
            toast.error('Failed to update tier');
        }
    };

    const filteredUsers = users.filter((u: any) => 
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTierBadge = (tier: string) => {
        switch (tier) {
            case 'pro': return <Badge className="bg-violet-100 text-violet-700 border-0 rounded-md font-bold text-[10px] uppercase px-2"><Zap className="w-3 h-3 mr-1" />PRO</Badge>;
            case 'premium': return <Badge className="bg-indigo-100 text-indigo-700 border-0 rounded-md font-bold text-[10px] uppercase px-2"><ShieldCheck className="w-3 h-3 mr-1" />PREMIUM</Badge>;
            default: return <Badge className="bg-slate-100 text-slate-500 border-0 rounded-md font-bold text-[10px] uppercase px-2">FREE</Badge>;
        }
    };

    const getWorkshopBadge = (status: string, isWorkshop: boolean) => {
        if (isWorkshop) return <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-md font-bold text-[10px] uppercase px-2"><Wrench className="w-3 h-3 mr-1" />ACTIVE WORKSHOP</Badge>;
        if (status === 'pending') return <Badge className="bg-amber-100 text-amber-700 border-0 rounded-md font-bold text-[10px] uppercase px-2">WORKSHOP PENDING</Badge>;
        return null;
    };

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">User Management</h1>
                        <p className="text-slate-500">Manage user accounts, tiers, and workshop permissions.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="rounded-xl px-4 py-2 text-sm font-bold bg-white border border-slate-100 shadow-sm text-slate-600">
                            <Users className="w-4 h-4 mr-2" /> {users.length} Total Users
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Filters */}
                    <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl bg-white border border-slate-100">
                        <CardHeader className="px-6 py-5 border-b border-slate-50">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Search & Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Search Identity</label>
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Name or email..."
                                        className="h-11 pl-10 rounded-xl bg-slate-50 border-none text-sm placeholder:text-slate-400"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 space-y-4 border-t border-slate-50">
                                <h4 className="text-xs font-bold text-slate-500 uppercase">System Health</h4>
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-xs font-bold text-emerald-800">Database Sync</p>
                                    <span className="text-sm text-emerald-600 mt-1 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                        Operational
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table */}
                    <Card className="lg:col-span-3 border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-50 bg-slate-50/50">
                                    <TableHead className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Identity</TableHead>
                                    <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Tier</TableHead>
                                    <TableHead className="py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</TableHead>
                                    <TableHead className="py-5 px-8 text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <TableRow key={i} className="border-slate-50">
                                            <TableCell className="p-8" colSpan={4}>
                                                <div className="h-12 bg-slate-50 rounded-2xl animate-pulse" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((u: any) => (
                                        <TableRow key={u.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                                            <TableCell className="py-5 px-8">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 rounded-2xl shadow-sm">
                                                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-sm">
                                                            {u.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-slate-900">{u.full_name || 'Anonymous User'}</p>
                                                            {u.role === 'admin' && <Badge className="bg-red-50 text-red-700 border-0 rounded-md text-[9px] font-black uppercase px-1.5 py-0 h-4">Admin</Badge>}
                                                        </div>
                                                        <p className="text-xs font-medium text-slate-400 mt-0.5">{u.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    {getTierBadge(u.account_tier || 'free')}
                                                    {getWorkshopBadge(u.workshop_status, u.is_workshop)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5 px-8 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-slate-100">
                                                        <DropdownMenuLabel className="px-3 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage Tier</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleUpdateTier(u.id, AccountTier.FREE)} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 focus:bg-slate-50 focus:text-slate-900">
                                                            Set to Free Tier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUpdateTier(u.id, AccountTier.PREMIUM)} className="rounded-xl px-3 py-2 text-sm font-bold text-indigo-600 focus:bg-indigo-50 focus:text-indigo-700">
                                                            Set to Premium
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUpdateTier(u.id, AccountTier.PRO)} className="rounded-xl px-3 py-2 text-sm font-bold text-violet-600 focus:bg-violet-50 focus:text-violet-700">
                                                            Set to Pro
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="my-2 bg-slate-50" />
                                                        <DropdownMenuLabel className="px-3 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Security</DropdownMenuLabel>
                                                        <DropdownMenuItem className="rounded-xl px-3 py-2 text-sm font-bold text-red-600 focus:bg-red-50 focus:text-red-700">
                                                            <ShieldAlert className="w-4 h-4 mr-2" /> Deactivate User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="p-24 text-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Search className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">No users found</h3>
                                            <p className="text-slate-500 max-w-sm mx-auto font-medium">Try a different name or email address in the search field.</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </FadeInView>
        </DashboardLayout>
    );
}
