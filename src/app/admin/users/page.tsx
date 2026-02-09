'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { Users, Search, Mail, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FadeInView } from '@/lib/animations';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchUsers() {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setUsers(data);
            }
            setLoading(false);
        }
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleStyle = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-500/10 text-red-600 border-red-200';
            case 'contributor': return 'bg-blue-500/10 text-blue-600 border-blue-200';
            default: return 'bg-green-500/10 text-green-600 border-green-200';
        }
    };

    return (
        <DashboardLayout role={UserRole.ADMIN}>
            <FadeInView delay={0.1} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">User Management</h1>
                        <p className="text-muted-foreground font-medium">Manage platform access and user roles.</p>
                    </div>
                    <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm self-start">
                        {users.length} Total Users
                    </Badge>
                </div>

                <div className="flex items-center gap-4 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by name or email..."
                            className="h-12 pl-11 rounded-2xl bg-card border-none shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                        <CardContent className="p-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-muted/20 rounded-xl animate-pulse mb-4" />
                            ))}
                        </CardContent>
                    </Card>
                ) : filteredUsers.length > 0 ? (
                    <div className="rounded-3xl border-none shadow-sm bg-card overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="py-4 px-6 font-bold text-xs uppercase tracking-wider">User</TableHead>
                                    <TableHead className="py-4 font-bold text-xs uppercase tracking-wider">Role</TableHead>
                                    <TableHead className="py-4 font-bold text-xs uppercase tracking-wider">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-muted/20 border-border/50">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                        {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-sm">{user.full_name || 'Unknown'}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge className={cn("rounded-full font-bold px-3 py-1", getRoleStyle(user.role))}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <Card className="border-none shadow-lg rounded-2xl">
                        <CardContent className="p-12 text-center">
                            <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No Users Found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? 'No users match your search.' : 'No registered users yet.'}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
