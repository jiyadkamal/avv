'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { User, Lock, Bell, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FadeInView } from '@/lib/animations';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');

    const handleSaveProfile = () => {
        toast.success('Profile updated successfully!');
    };

    return (
        <DashboardLayout role={user?.role || UserRole.SUBSCRIBER}>
            <FadeInView delay={0.1} className="space-y-8 max-w-3xl">
                <div className="px-1">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Settings</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Manage your account preferences.</p>
                </div>

                {/* Profile Section */}
                <Card className="border-none shadow-sm rounded-2xl md:rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-6 md:p-8 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <CardTitle className="text-lg md:text-xl">Profile Information</CardTitle>
                                <CardDescription className="text-sm">Update your personal details.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-4 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="h-11 md:h-12 rounded-xl bg-muted/50 border-none px-4"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11 md:h-12 rounded-xl bg-muted/50 border-none px-4"
                                    disabled
                                />
                            </div>
                        </div>
                        <Button onClick={handleSaveProfile} className="w-full sm:w-auto rounded-xl md:rounded-2xl h-11 md:h-12 px-8 font-bold">
                            Save Changes
                        </Button>
                    </CardContent>
                </Card>

                {/* Security Section */}
                <Card className="border-none shadow-sm rounded-2xl md:rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-6 md:p-8 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
                                <Lock className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                            </div>
                            <div className="min-w-0">
                                <CardTitle className="text-lg md:text-xl">Security</CardTitle>
                                <CardDescription className="text-sm">Manage your password settings.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-4 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Password</Label>
                                <Input type="password" className="h-11 md:h-12 rounded-xl bg-muted/50 border-none px-4" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                                <Input type="password" className="h-11 md:h-12 rounded-xl bg-muted/50 border-none px-4" />
                            </div>
                        </div>
                        <Button variant="outline" className="w-full sm:w-auto rounded-xl md:rounded-2xl h-11 md:h-12 px-8 font-bold">
                            Change Password
                        </Button>
                    </CardContent>
                </Card>

                {/* Notifications Section */}
                <Card className="border-none shadow-sm rounded-2xl md:rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-6 md:p-8 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Bell className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                            </div>
                            <div className="min-w-0">
                                <CardTitle className="text-lg md:text-xl">Notifications</CardTitle>
                                <CardDescription className="text-sm">Configure how you receive updates.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-4">
                        <p className="text-sm text-muted-foreground">Notification preferences will be available soon.</p>
                    </CardContent>
                </Card>
            </FadeInView>
        </DashboardLayout>
    );
}
