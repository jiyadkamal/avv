'use client';

import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { User, Lock, Camera, Loader2, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeInView } from '@/lib/animations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, setUser, logout } = useAuthStore();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be under 5MB');
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            if (fullName) formData.append('full_name', fullName);
            if (avatarFile) formData.append('avatar', avatarFile);

            const res = await fetch('/api/profile', {
                method: 'PATCH',
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setUser(data.user);
                setAvatarFile(null);
                toast.success('Profile updated successfully!');
            } else {
                toast.error(data.error || 'Failed to update profile');
            }
        } catch (err) {
            toast.error('An error occurred');
        }
        setIsSaving(false);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const role = user?.role === 'admin' ? UserRole.ADMIN : UserRole.USER;

    return (
        <DashboardLayout role={role}>
            <FadeInView delay={0.1} className="space-y-8 max-w-3xl mx-auto">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">Settings</h1>
                    <p className="text-slate-500 font-medium">Manage your account and preferences.</p>
                </div>

                {/* Profile Picture & Info */}
                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                <User className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
                                <CardDescription>Update your photo and personal details.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-8">
                        {/* Avatar Upload */}
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200 ring-4 ring-white">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black text-white">{initials}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all group-hover:scale-110"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <div className="text-center sm:text-left space-y-1">
                                <h3 className="text-lg font-bold text-slate-900">{user?.full_name || 'User'}</h3>
                                <p className="text-sm text-slate-500">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className={cn(
                                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border-0",
                                        user?.role === 'admin' ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700"
                                    )}>
                                        {user?.role === 'admin' ? 'Admin' : 'User'}
                                    </Badge>
                                    {user?.account_tier && user.account_tier !== 'free' && (
                                        <Badge className="bg-violet-100 text-violet-700 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border-0">
                                            {user.account_tier}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Click the camera icon to upload a new photo</p>
                            </div>
                        </div>

                        {/* Name + Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</Label>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="h-12 rounded-xl bg-slate-50 border-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</Label>
                                <Input
                                    value={user?.email || ''}
                                    className="h-12 rounded-xl bg-slate-50 border-none"
                                    disabled
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="rounded-2xl h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg shadow-indigo-200"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Account Actions */}
                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white border border-slate-100">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Account</CardTitle>
                                <CardDescription>Manage your session.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="rounded-2xl h-12 px-8 border-red-200 text-red-600 hover:bg-red-50 font-bold gap-2"
                        >
                            <LogOut className="w-5 h-5" /> Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </FadeInView>
        </DashboardLayout>
    );
}
