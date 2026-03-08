'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { Upload, Car, AlertTriangle, Loader2, X, MapPin, Plus, Camera } from 'lucide-react';
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

export default function UploadReportPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({ vehicle_vin: '', vehicle_plate: '', vehicle_make: '', vehicle_model: '', description: '', severity: '', accident_date: '' });
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => { if (navigator.geolocation) navigator.geolocation.getCurrentPosition(pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }), () => { }); }, []);

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
        if (!form.vehicle_vin || !form.vehicle_make || !form.vehicle_model || !form.severity || !form.accident_date) { toast.error('Please fill in all required fields'); return; }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => formData.append(key, value));
            if (location) { formData.append('latitude', location.lat.toString()); formData.append('longitude', location.lng.toString()); }
            images.forEach(img => formData.append('images', img));
            const res = await fetch('/api/reports', { method: 'POST', body: formData });
            if (!res.ok) { const data = await res.json(); toast.error(data.error || 'Failed to submit'); setIsSubmitting(false); return; }
            toast.success('Report submitted successfully!');
            router.push('/contributor/reports');
        } catch (error) { console.error(error); toast.error('Failed to submit report.'); }
        setIsSubmitting(false);
    };

    return (
        <DashboardLayout role={UserRole.CONTRIBUTOR}>
            <FadeInView delay={0.1} className="space-y-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Submit Report</h1>
                    <p className="text-slate-500 text-sm">Contribute verified accident data and earn rewards.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="px-6 py-5 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center"><Car className="w-5 h-5 text-indigo-600" /></div>
                                <div><CardTitle className="text-lg font-semibold">Vehicle Information</CardTitle><CardDescription className="text-xs text-slate-500">Primary identification data</CardDescription></div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label className="text-xs font-medium text-slate-700">VIN *</Label><Input value={form.vehicle_vin} onChange={e => setForm(prev => ({ ...prev, vehicle_vin: e.target.value }))} placeholder="17-digit identifier" className="h-10 rounded-lg bg-slate-50 border-slate-200" required /></div>
                                <div className="space-y-2"><Label className="text-xs font-medium text-slate-500">License Plate</Label><Input value={form.vehicle_plate} onChange={e => setForm(prev => ({ ...prev, vehicle_plate: e.target.value }))} placeholder="e.g. KA 01 AB 1234" className="h-10 rounded-lg bg-slate-50 border-slate-200" /></div>
                                <div className="space-y-2"><Label className="text-xs font-medium text-slate-700">Make *</Label><Input value={form.vehicle_make} onChange={e => setForm(prev => ({ ...prev, vehicle_make: e.target.value }))} placeholder="e.g. Toyota" className="h-10 rounded-lg bg-slate-50 border-slate-200" required /></div>
                                <div className="space-y-2"><Label className="text-xs font-medium text-slate-700">Model *</Label><Input value={form.vehicle_model} onChange={e => setForm(prev => ({ ...prev, vehicle_model: e.target.value }))} placeholder="e.g. Camry" className="h-10 rounded-lg bg-slate-50 border-slate-200" required /></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="px-6 py-5 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
                                <div><CardTitle className="text-lg font-semibold">Accident Details</CardTitle><CardDescription className="text-xs text-slate-500">Severity and description</CardDescription></div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label className="text-xs font-medium text-slate-700">Severity *</Label>
                                    <Select onValueChange={val => setForm(prev => ({ ...prev, severity: val }))}>
                                        <SelectTrigger className="h-10 rounded-lg bg-slate-50 border-slate-200"><SelectValue placeholder="Select severity" /></SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 rounded-lg"><SelectItem value="minor">Minor</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="severe">Severe</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label className="text-xs font-medium text-slate-700">Date *</Label><Input type="date" value={form.accident_date} onChange={e => setForm(prev => ({ ...prev, accident_date: e.target.value }))} className="h-10 rounded-lg bg-slate-50 border-slate-200" required /></div>
                            </div>
                            <div className="space-y-2"><Label className="text-xs font-medium text-slate-500">Description</Label><Textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the accident and damage..." className="min-h-[120px] rounded-lg bg-slate-50 border-slate-200" /></div>
                            {location && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <MapPin className="w-4 h-4 text-indigo-500" />Geolocation: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="px-6 py-5 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center"><Camera className="w-5 h-5 text-violet-600" /></div>
                                <div><CardTitle className="text-lg font-semibold">Photos</CardTitle><CardDescription className="text-xs text-slate-500">Upload up to 5 images</CardDescription></div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
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
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" />Submit Report</>}
                    </Button>
                </form>
            </FadeInView>
        </DashboardLayout>
    );
}
