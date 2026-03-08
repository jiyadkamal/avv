'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { Wrench, MapPin, Camera, Loader2, X, Plus, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FadeInView } from '@/lib/animations';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { STATES, getDistricts } from '@/lib/locations';

export default function WorkshopListingPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({ name: '', state: '', district: '', description: '' });
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const districts = form.state ? getDistricts(form.state) : [];

    useEffect(() => {
        async function fetchExisting() {
            if (!user?.id) { setLoading(false); return; }
            try { const res = await fetch(`/api/workshops?owner_id=${user.id}`); const data = await res.json(); if (data.workshops?.length > 0) { const w = data.workshops[0]; setForm({ name: w.name || '', state: w.state || '', district: w.district || '', description: w.description || '' }); setExistingImages(w.images || []); setIsEditing(true); } }
            catch (e) { console.error(e); }
            setLoading(false);
        }
        fetchExisting();
    }, [user?.id]);

    const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 5) { toast.error('Maximum 5 images allowed'); return; }
        setImages(prev => [...prev, ...files]);
        files.forEach(file => { const reader = new FileReader(); reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]); reader.readAsDataURL(file); });
    };
    const removeImage = (index: number) => { setImages(prev => prev.filter((_, i) => i !== index)); setPreviews(prev => prev.filter((_, i) => i !== index)); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) { toast.error('You must be signed in'); return; }
        if (!form.name || !form.state || !form.district) { toast.error('Please fill in name, state and district'); return; }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => formData.append(key, value));
            images.forEach(img => formData.append('images', img));
            const res = await fetch('/api/workshops', { method: 'POST', body: formData });
            if (!res.ok) { const data = await res.json(); toast.error(data.error || 'Failed to save'); setIsSubmitting(false); return; }
            toast.success(isEditing ? 'Workshop updated!' : 'Workshop listed!');
            router.push('/workshop/dashboard');
        } catch (error) { console.error(error); toast.error('Failed to save workshop.'); }
        setIsSubmitting(false);
    };

    if (loading) return <DashboardLayout role={UserRole.WORKSHOP}><div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div></DashboardLayout>;

    return (
        <DashboardLayout role={UserRole.WORKSHOP}>
            <FadeInView delay={0.1} className="space-y-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{isEditing ? 'Edit Workshop' : 'List Workshop'}</h1>
                    <p className="text-slate-500 text-sm">Register your workshop to be found by vehicle owners.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="px-6 py-5 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center"><Wrench className="w-5 h-5 text-indigo-600" /></div>
                                <div><CardTitle className="text-lg font-semibold">Workshop Details</CardTitle><CardDescription className="text-xs text-slate-500">Name and description</CardDescription></div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-4">
                            <div className="space-y-2"><Label className="text-xs font-medium text-slate-700">Workshop Name *</Label><Input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. AutoCare Pro Workshop" className="h-10 rounded-lg bg-slate-50 border-slate-200" required /></div>
                            <div className="space-y-2"><Label className="text-xs font-medium text-slate-500">Description</Label><Textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe your services, specializations..." className="min-h-[120px] rounded-lg bg-slate-50 border-slate-200" /></div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="px-6 py-5 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center"><MapPin className="w-5 h-5 text-violet-600" /></div>
                                <div><CardTitle className="text-lg font-semibold">Location</CardTitle><CardDescription className="text-xs text-slate-500">Select state and district</CardDescription></div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label className="text-xs font-medium text-slate-700">State *</Label>
                                    <Select value={form.state} onValueChange={val => setForm(prev => ({ ...prev, state: val, district: '' }))}>
                                        <SelectTrigger className="h-10 rounded-lg bg-slate-50 border-slate-200"><SelectValue placeholder="Select State" /></SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 rounded-lg max-h-[300px]">{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label className="text-xs font-medium text-slate-700">District *</Label>
                                    <Select value={form.district} onValueChange={val => setForm(prev => ({ ...prev, district: val }))} disabled={!form.state}>
                                        <SelectTrigger className="h-10 rounded-lg bg-slate-50 border-slate-200"><SelectValue placeholder={form.state ? "Select District" : "Select state first"} /></SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 rounded-lg max-h-[300px]">{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="px-6 py-5 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Camera className="w-5 h-5 text-blue-600" /></div>
                                <div><CardTitle className="text-lg font-semibold">Shop Photos</CardTitle><CardDescription className="text-xs text-slate-500">Upload up to 5 images</CardDescription></div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
                            {existingImages.length > 0 && previews.length === 0 && (
                                <div className="mb-4"><p className="text-xs text-slate-500 mb-2">Current images — upload new to replace</p>
                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{existingImages.map((img, i) => <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-200 opacity-60"><img src={img} alt="" className="w-full h-full object-cover" /></div>)}</div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                {previews.map((p, i) => (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200">
                                        <img src={p} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><X className="w-3.5 h-3.5 text-white" /></button>
                                    </motion.div>
                                ))}
                                {images.length < 5 && (
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all">
                                        <Plus className="w-5 h-5 text-slate-400" /><span className="text-xs text-slate-400 font-medium">Add Photo</span>
                                    </button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base gap-2">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" />{isEditing ? 'Update Workshop' : 'Publish Workshop'}</>}
                    </Button>
                </form>
            </FadeInView>
        </DashboardLayout>
    );
}
