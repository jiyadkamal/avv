'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { Users, Search, Mail, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FadeInView } from '@/lib/animations';
import { cn } from '@/lib/utils';

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchUsers() {
            try { const res = await fetch('/api/users'); const data = await res.json(); setUsers(data.users || []); }
            catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((u: any) => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">User Management</h1>
                        <p className="text-slate-500 text-sm">Manage platform users and access roles.</p>
                    </div>
                    <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-semibold bg-slate-100 text-slate-700 border-0">
                        {users.length} Users
                    </Badge>
                </div>

                <div className="max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or email..."
                            className="h-10 pl-10 rounded-lg bg-white border-slate-200 text-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <Card className="bg-white border-slate-200 rounded-xl"><CardContent className="p-6 space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />)}</CardContent></Card>
                ) : filteredUsers.length > 0 ? (
                    <Card className="bg-white border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-100 bg-slate-50">
                                    <TableHead className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</TableHead>
                                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</TableHead>
                                    <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((u: any) => (
                                    <TableRow key={u.id} className="hover:bg-slate-50 border-slate-100">
                                        <TableCell className="py-3.5 px-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-semibold">
                                                        {u.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">{u.full_name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3.5">
                                            <Badge className={cn("rounded-full font-medium text-xs border-0 capitalize",
                                                u.role === 'admin' ? "bg-red-50 text-red-700" :
                                                    u.role === 'contributor' ? "bg-blue-50 text-blue-700" :
                                                        u.role === 'workshop' ? "bg-amber-50 text-amber-700" :
                                                            "bg-emerald-50 text-emerald-700"
                                            )}>
                                                {u.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3.5 text-sm text-slate-500">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                ) : (
                    <Card className="bg-white border-slate-200 rounded-xl">
                        <CardContent className="p-12 text-center">
                            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <h3 className="font-semibold text-slate-900 mb-1">No users found</h3>
                            <p className="text-slate-500 text-sm">{searchQuery ? 'Try a different search term.' : 'No users registered yet.'}</p>
                        </CardContent>
                    </Card>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
