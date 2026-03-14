'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole, WorkshopStatus } from '@/types';
import { 
    Wrench, ShieldCheck, DollarSign, ArrowRight, 
    Loader2, Upload, FileText, CheckCircle2, AlertCircle,
    Plus, Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function WorkshopApplyPage() {
    const { user, setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Sync latest user state on mount
    useEffect(() => {
        async function syncUser() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) setUser(data.user);
                }
            } catch (e) { console.error(e); }
        }
        syncUser();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const res = await fetch('/api/workshop-request', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Workshop application submitted successfully!');
                if (user) {
                    setUser({ ...user, workshop_status: WorkshopStatus.PENDING });
                }
            } else {
                toast.error(data.error || 'Failed to submit application');
            }
        } catch (err) {
            toast.error('An error occurred during submission');
        }
        setIsLoading(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!user) return null;

    return (
        <DashboardLayout role={UserRole.USER}>
            <FadeInView delay={0.1} className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-slate-900">Workshop Account</h1>
                    <p className="text-slate-500">Apply to become a verified workshop and earn $10 per report.</p>
                </div>

                {user.is_workshop ? (
                    <Card className="border-none shadow-sm rounded-3xl bg-emerald-50 border border-emerald-100 overflow-hidden">
                        <CardContent className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-200">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-emerald-900">Your Workshop is Active!</h2>
                            <p className="text-emerald-700 max-w-md mx-auto">
                                Congratulations! Your account has been verified as a professional workshop. You now earn $10 for every approved report you submit.
                            </p>
                            <div className="flex justify-center gap-4 mt-6">
                                <Link href="/user/upload">
                                    <Button className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                                        Submit New Report
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : user.workshop_status === WorkshopStatus.PENDING ? (
                    <Card className="border-none shadow-sm rounded-3xl bg-blue-50 border border-blue-100">
                        <CardContent className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white">
                                <Clock className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-blue-900">Verification in Progress</h2>
                            <p className="text-blue-700 max-w-md mx-auto">
                                We've received your application. Our team is currently verifying your workshop details and GST number. This usually takes 24-48 hours.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Benefits Sidebar */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-sm rounded-3xl p-6 bg-white border border-slate-100">
                                <h3 className="font-bold text-lg mb-6">Workshop Benefits</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">$10 per Report</p>
                                            <p className="text-xs text-slate-500">Double the standard reward for your professional submissions.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Professional Badge</p>
                                            <p className="text-xs text-slate-500">Your reports are marked as verified by a professional workshop.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Enhanced Reports</p>
                                            <p className="text-xs text-slate-500">Include service details, parts replaced, and invoices in your reports.</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
                                <p className="text-amber-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Requirement
                                </p>
                                <p className="text-sm font-medium leading-relaxed">
                                    You must provide a valid GST number and a clear photo of your workshop storefront/entrance for verification.
                                </p>
                            </div>
                        </div>

                        {/* Application Form */}
                        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-8 border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Workshop Name</Label>
                                        <Input name="name" required placeholder="Elite Motors" className="h-12 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">GST Number</Label>
                                        <Input name="gst_number" required placeholder="22AAAAA0000A1Z5" className="h-12 rounded-xl" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">State</Label>
                                        <Input name="state" required placeholder="Kerala" className="h-12 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">District</Label>
                                        <Input name="district" required placeholder="Ernakulam" className="h-12 rounded-xl" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Workshop Description</Label>
                                    <Textarea name="description" placeholder="Briefly describe your workshop services..." className="rounded-xl min-h-[100px]" />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-sm font-bold">Workshop Image</Label>
                                    <div className="relative group">
                                        <div className={cn(
                                            "border-2 border-dashed rounded-3xl p-8 transition-all text-center",
                                            imagePreview ? "border-indigo-600 bg-indigo-50/20" : "border-slate-200 hover:border-indigo-400"
                                        )}>
                                            {imagePreview ? (
                                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md">
                                                    <img src={imagePreview} alt="Workshop Preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setImagePreview(null)}
                                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 shadow-lg hover:bg-white text-red-500"
                                                    >
                                                        <Plus className="w-5 h-5 rotate-45" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer flex flex-col items-center justify-center gap-2 h-32">
                                                    <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 mb-2">
                                                        <Upload className="w-6 h-6" />
                                                    </div>
                                                    <p className="font-bold text-slate-700">Click to upload photo</p>
                                                    <p className="text-xs text-slate-400">Storefront image or official document</p>
                                                    <input 
                                                        type="file" 
                                                        name="workshop_image" 
                                                        accept="image/*" 
                                                        onChange={handleImageChange} 
                                                        className="hidden" 
                                                        required 
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg gap-2 shadow-lg active:scale-[0.98] transition-all"
                                >
                                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Submit Application <ArrowRight className="w-5 h-5" /></>}
                                </Button>
                            </form>
                        </Card>
                    </div>
                )}
            </FadeInView>
        </DashboardLayout>
    );
}
