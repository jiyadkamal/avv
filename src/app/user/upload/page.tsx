'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import type { User } from '@/types';
import { 
    Upload, Car, AlertTriangle, Loader2, X, MapPin, 
    Plus, Camera, Wrench, FileText, Info, Navigation 
} from 'lucide-react';
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
import { cn } from '@/lib/utils';

const LocationMap = dynamic(() => import('@/components/LocationMap'), { ssr: false });

export default function UploadReportPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const invoiceInputRef = useRef<HTMLInputElement>(null);

    const [reportType, setReportType] = useState<'normal' | 'workshop'>(user?.is_workshop ? 'workshop' : 'normal');
    const [form, setForm] = useState({ 
        vehicle_vin: '', 
        vehicle_plate: '', 
        vehicle_make: '', 
        vehicle_model: '', 
        description: '', 
        severity: '', 
        accident_date: '',
        service_details: '',
        replaced_parts: ''
    });

    const handleReportTypeChange = (type: 'normal' | 'workshop') => {
        setReportType(type);
        if (type === 'normal') {
            setForm(prev => ({ ...prev, service_details: '', replaced_parts: '' }));
            setInvoiceFile(null);
            setInvoicePreview(null);
        }
    };

    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [invoicePreview, setInvoicePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 20.5937, lng: 78.9629 });
    const [address, setAddress] = useState('');
    const [detectingLocation, setDetectingLocation] = useState(false);

    useEffect(() => { 
        autoDetectLocation();
    }, []);

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`, {
                headers: { 'Accept-Language': 'en' }
            });
            const data = await res.json();
            if (data.display_name) setAddress(data.display_name);
        } catch { setAddress(''); }
    };

    const handleLocationChange = (lat: number, lng: number) => {
        setLocation({ lat, lng });
        reverseGeocode(lat, lng);
    };

    const autoDetectLocation = () => {
        if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setLocation({ lat, lng });
                reverseGeocode(lat, lng);
                setDetectingLocation(false);
                toast.success('Location detected!');
            }, 
            () => {
                setDetectingLocation(false);
                toast.error('Could not detect location');
            },
            { enableHighAccuracy: true }
        );
    };

    const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 5) { toast.error('Maximum 5 images allowed'); return; }
        
        setImages(prev => [...prev, ...files]);
        files.forEach(file => { 
            const reader = new FileReader(); 
            reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]); 
            reader.readAsDataURL(file); 
        });
    };

    const removeImage = (index: number) => { 
        setImages(prev => prev.filter((_, i) => i !== index)); 
        setPreviews(prev => prev.filter((_, i) => i !== index)); 
    };

    const handleInvoiceAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setInvoiceFile(file);
            const reader = new FileReader();
            reader.onload = e => setInvoicePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) { toast.error('You must be signed in'); return; }
        if (!form.vehicle_vin || !form.vehicle_make || !form.vehicle_model || !form.severity || !form.accident_date) { 
            toast.error('Please fill in all required fields'); 
            return; 
        }
        
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });
            if (user.is_workshop) formData.append('report_type', reportType);
            
            formData.append('latitude', location.lat.toString()); 
            formData.append('longitude', location.lng.toString());
            if (address) formData.append('address', address);
            
            images.forEach(img => formData.append('images', img));
            if (invoiceFile) formData.append('invoice', invoiceFile);

            const res = await fetch('/api/reports', { method: 'POST', body: formData });
            
            if (!res.ok) { 
                const data = await res.json(); 
                toast.error(data.error || 'Failed to submit'); 
                setIsSubmitting(false); 
                return; 
            }
            
            toast.success('Report submitted successfully!');
            router.push('/user/reports');
        } catch (error) { 
            console.error(error); 
            toast.error('Failed to submit report.'); 
        }
        setIsSubmitting(false);
    };

    if (!user) return null;

    return (
        <DashboardLayout role={UserRole.USER}>
            <FadeInView delay={0.1} className="space-y-8 max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">Submit Accident Report</h1>
                        <p className="text-slate-500 text-sm">Contribute verified data and earn rewards.</p>
                    </div>
                    {user.is_workshop && reportType === 'workshop' && (
                        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                            <Wrench className="w-4 h-4" />
                            <span className="text-sm font-bold">Workshop Bonus Active ($10)</span>
                        </div>
                    )}
                </div>

                {/* Report Type Selector — Workshop Users Only */}
                {user.is_workshop && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-2 flex gap-2">
                        <button
                            type="button"
                            onClick={() => handleReportTypeChange('normal')}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200',
                                reportType === 'normal'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            )}
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Normal Report
                        </button>
                        <button
                            type="button"
                            onClick={() => handleReportTypeChange('workshop')}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200',
                                reportType === 'workshop'
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            )}
                        >
                            <Wrench className="w-4 h-4" />
                            Workshop Report
                            <span className={cn(
                                'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md',
                                reportType === 'workshop' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                            )}>+$10</span>
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Vehicle Info */}
                    <Card className="border-none shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm"><Car className="w-6 h-6 text-indigo-600" /></div>
                                <div><CardTitle className="text-xl font-bold">Vehicle Information</CardTitle><CardDescription>Identify the vehicle involved</CardDescription></div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">VIN (Vehicle Identification Number) *</Label>
                                    <Input value={form.vehicle_vin} onChange={e => setForm(prev => ({ ...prev, vehicle_vin: e.target.value.replace(/\D/g, '') }))} inputMode="numeric" pattern="[0-9]*" placeholder="Numbers only" className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">License Plate</Label>
                                    <Input value={form.vehicle_plate} onChange={e => setForm(prev => ({ ...prev, vehicle_plate: e.target.value }))} placeholder="e.g. KA 01 AB 1234" className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">Make *</Label>
                                    <Input value={form.vehicle_make} onChange={e => setForm(prev => ({ ...prev, vehicle_make: e.target.value }))} placeholder="e.g. Toyota" className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500" required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">Model *</Label>
                                    <Input value={form.vehicle_model} onChange={e => setForm(prev => ({ ...prev, vehicle_model: e.target.value }))} placeholder="e.g. Camry" className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500" required />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Accident Details */}
                    <Card className="border-none shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm"><AlertTriangle className="w-6 h-6 text-amber-600" /></div>
                                <div><CardTitle className="text-xl font-bold">Accident Details</CardTitle><CardDescription>Describe the incident and its impact</CardDescription></div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">Severity *</Label>
                                    <Select onValueChange={val => setForm(prev => ({ ...prev, severity: val }))}>
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none focus:ring-indigo-500">
                                            <SelectValue placeholder="Select severity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="minor">Minor Damage</SelectItem>
                                            <SelectItem value="moderate">Moderate Damage</SelectItem>
                                            <SelectItem value="severe">Severe / Total Loss</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">Date of Incident *</Label>
                                    <Input type="date" value={form.accident_date} onChange={e => setForm(prev => ({ ...prev, accident_date: e.target.value }))} className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Damage Description</Label>
                                <Textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Details about the accident, impacted areas, and incident context..." className="min-h-[120px] rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Workshop Specifics (Conditional) */}
                    <AnimatePresence>
                        {user.is_workshop && reportType === 'workshop' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                <Card className="border-none shadow-sm rounded-3xl border-2 border-emerald-100 bg-emerald-50/20 overflow-hidden mb-6">
                                    <CardHeader className="bg-emerald-50 px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600"><Wrench className="w-6 h-6" /></div>
                                            <div><CardTitle className="text-xl font-bold">Workshop Service Details</CardTitle><CardDescription className="text-emerald-700/70">Professional repair information (required for $10 bonus)</CardDescription></div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-emerald-900">Services Performed *</Label>
                                            <Textarea required={reportType === 'workshop'} value={form.service_details} onChange={e => setForm(prev => ({ ...prev, service_details: e.target.value }))} placeholder="List all repairs and checks performed on the vehicle..." className="min-h-[100px] rounded-xl bg-white border-none focus-visible:ring-emerald-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-emerald-900">Parts Replaced (Optional)</Label>
                                            <Input value={form.replaced_parts} onChange={e => setForm(prev => ({ ...prev, replaced_parts: e.target.value }))} placeholder="e.g. Front Bumper, Radiator, Headlights" className="h-12 rounded-xl bg-white border-none focus-visible:ring-emerald-500" />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-sm font-bold text-emerald-900">Upload Invoice / Job Card</Label>
                                            <div className="relative group">
                                                <div className={cn(
                                                    "border-2 border-dashed rounded-2xl p-6 transition-all text-center group-hover:bg-white/50",
                                                    invoicePreview ? "border-emerald-500 bg-emerald-50/50" : "border-emerald-200"
                                                )}>
                                                    <input ref={invoiceInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleInvoiceAdd} />
                                                    {invoicePreview ? (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="w-5 h-5 text-emerald-600" />
                                                                <span className="text-sm font-medium text-emerald-900">{invoiceFile?.name}</span>
                                                            </div>
                                                            <button type="button" onClick={() => { setInvoiceFile(null); setInvoicePreview(null); }} className="p-1 hover:bg-emerald-200 rounded-full text-emerald-600"><X className="w-4 h-4" /></button>
                                                        </div>
                                                    ) : (
                                                        <button type="button" onClick={() => invoiceInputRef.current?.click()} className="flex flex-col items-center gap-2 mx-auto">
                                                            <Upload className="w-6 h-6 text-emerald-400" />
                                                            <span className="text-sm font-bold text-emerald-700">Upload Invoice Photo</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Photos */}
                    <Card className="border-none shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm"><Camera className="w-6 h-6 text-violet-600" /></div>
                                <div><CardTitle className="text-xl font-bold">Photos</CardTitle><CardDescription>Upload clear photos of the damage (max 5)</CardDescription></div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {previews.map((p, i) => (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm">
                                        <img src={p} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"><X className="w-4 h-4" /></button>
                                    </motion.div>
                                ))}
                                {images.length < 5 && (
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                                        <div className="p-3 bg-slate-50 rounded-full text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all"><Plus className="w-6 h-6" /></div>
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Add Photo</span>
                                    </button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location Map */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white border border-slate-100">
                        <CardHeader className="bg-slate-50/50 px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900">Location</CardTitle>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={autoDetectLocation}
                                    disabled={detectingLocation}
                                    className="rounded-xl h-10 px-4 bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-xs uppercase tracking-widest gap-2 shadow-sm"
                                >
                                    {detectingLocation ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Navigation className="w-4 h-4 text-indigo-600" />}
                                    Auto-Detect
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-6 pt-6">
                            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-inner" style={{ height: '320px' }}>
                                <LocationMap
                                    lat={location.lat}
                                    lng={location.lng}
                                    onLocationChange={handleLocationChange}
                                />
                            </div>
                            {address && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detected Address</Label>
                                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                                        <span className="text-sm font-medium text-slate-700 leading-relaxed">{address}</span>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Latitude</Label>
                                    <div className="h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center px-4">
                                        <span className="text-sm font-mono font-bold text-slate-600">{location.lat.toFixed(4)}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Longitude</Label>
                                    <div className="h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center px-4">
                                        <span className="text-sm font-mono font-bold text-slate-600">{location.lng.toFixed(4)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl flex gap-3 items-start border border-slate-100">
                            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                By submitting this report, you verify that the information is accurate. Fraudulent reports will lead to permanent account suspension and forfeiture of rewards.
                            </p>
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg gap-3 shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all">
                            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Upload className="w-6 h-6" /> Submit Report</>}
                        </Button>
                    </div>
                </form>
            </FadeInView>
        </DashboardLayout>
    );
}
