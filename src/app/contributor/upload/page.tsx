'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import {
    Plus,
    Trash2,
    MapPin,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export default function UploadReportPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    // Form data
    const [formData, setFormData] = useState({
        vin: '',
        licensePlate: '',
        make: '',
        model: '',
        description: '',
        accidentDate: '',
        severity: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const updateForm = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages = Array.from(files);
            setImages(prev => [...prev, ...newImages]);
            const newUrls = newImages.map(file => URL.createObjectURL(file));
            setImageUrls(prev => [...prev, ...newUrls]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }));
                    toast.success("Location captured!");
                },
                () => {
                    toast.error("Could not get location");
                }
            );
        }
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        console.log('handleSubmit called, user:', user);

        if (!user) {
            toast.error("Please log in to submit a report");
            setIsSubmitting(false);
            return;
        }

        if (!formData.vin && !formData.make) {
            toast.error("Please fill in vehicle details");
            return;
        }

        setIsSubmitting(true);
        console.log('Starting report submission...');

        try {
            // Try to upload images to Supabase Storage (optional - skip if fails)
            const uploadedImageUrls: string[] = [];

            if (images.length > 0) {
                console.log('Attempting to upload', images.length, 'images...');
                for (const image of images) {
                    try {
                        const fileName = `${user.id}/${Date.now()}-${image.name}`;

                        // Wrap upload in a timeout (10 seconds)
                        const uploadPromise = supabase.storage
                            .from('report-images')
                            .upload(fileName, image);

                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Upload timeout - please try again')), 10000)
                        );

                        const result = await Promise.race([uploadPromise, timeoutPromise]) as any;

                        if (result?.error) {
                            console.error('Image upload failed:', result.error.message);
                            toast.error(`Image upload failed: ${result.error.message}`);
                            setIsSubmitting(false);
                            return; // Stop submission
                        } else {
                            const { data } = supabase.storage
                                .from('report-images')
                                .getPublicUrl(fileName);
                            uploadedImageUrls.push(data.publicUrl);
                            console.log('Image uploaded:', data.publicUrl);
                        }
                    } catch (imgErr: any) {
                        console.error('Image upload error:', imgErr?.message || imgErr);
                        toast.error(`Image upload failed: ${imgErr?.message || 'Unknown error'}`);
                        setIsSubmitting(false);
                        return; // Stop submission
                    }
                }
                console.log('All images uploaded successfully:', uploadedImageUrls.length);
            }

            console.log('Inserting report into database...');

            // Create report in database
            const reportData = {
                contributor_id: user.id,
                vehicle_vin: formData.vin || null,
                vehicle_plate: formData.licensePlate || null,
                vehicle_make: formData.make,
                vehicle_model: formData.model || null,
                description: formData.description || null,
                accident_date: formData.accidentDate || null,
                severity: formData.severity || null,
                latitude: formData.latitude,
                longitude: formData.longitude,
                images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
                status: 'pending',
            };

            console.log('Report data:', reportData);

            const { data, error } = await supabase
                .from('reports')
                .insert(reportData)
                .select();

            console.log('Insert result:', { data, error });

            if (error) {
                console.error('Error submitting report:', error);
                toast.error(`Failed to submit report: ${error.message}`);
                setIsSubmitting(false);
                return;
            }

            toast.success("Report submitted successfully! Awaiting admin review.");
            router.push("/contributor/dashboard");
        } catch (err) {
            console.error('Unexpected error:', err);
            toast.error("An unexpected error occurred. Check console for details.");
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout role={UserRole.CONTRIBUTOR}>
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Report an Accident</h1>
                    <p className="text-muted-foreground">Follow the steps below to submit a verified accident report.</p>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between px-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors",
                                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                            </div>
                            {s < 3 && (
                                <div className={cn(
                                    "w-16 h-1 mx-2 rounded-full",
                                    step > s ? "bg-primary" : "bg-muted"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                <Card className="border-none shadow-xl shadow-black/5 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle>
                            {step === 1 && "Vehicle Details"}
                            {step === 2 && "Accident Details"}
                            {step === 3 && "Photos & GPS"}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 && "Start by identifying the vehicle involved."}
                            {step === 2 && "Tell us more about the accident context."}
                            {step === 3 && "Upload clear evidence and capture location."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-6">
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">VIN Number</Label>
                                    <Input
                                        placeholder="17-digit VIN"
                                        className="h-12 rounded-xl bg-muted/50 border-none px-4"
                                        value={formData.vin}
                                        onChange={(e) => updateForm('vin', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">License Plate</Label>
                                    <Input
                                        placeholder="e.g. ABC 1234"
                                        className="h-12 rounded-xl bg-muted/50 border-none px-4"
                                        value={formData.licensePlate}
                                        onChange={(e) => updateForm('licensePlate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Make</Label>
                                    <Input
                                        placeholder="e.g. Toyota"
                                        className="h-12 rounded-xl bg-muted/50 border-none px-4"
                                        value={formData.make}
                                        onChange={(e) => updateForm('make', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Model</Label>
                                    <Input
                                        placeholder="e.g. Camry"
                                        className="h-12 rounded-xl bg-muted/50 border-none px-4"
                                        value={formData.model}
                                        onChange={(e) => updateForm('model', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What happened?</Label>
                                    <Textarea
                                        placeholder="Describe the damages and circumstances..."
                                        className="min-h-[150px] rounded-2xl bg-muted/50 border-none p-4"
                                        value={formData.description}
                                        onChange={(e) => updateForm('description', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Accident Date</Label>
                                        <Input
                                            type="date"
                                            className="h-12 rounded-xl bg-muted/50 border-none px-4"
                                            value={formData.accidentDate}
                                            onChange={(e) => updateForm('accidentDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Severity</Label>
                                        <Input
                                            placeholder="Major / Minor / Totalled"
                                            className="h-12 rounded-xl bg-muted/50 border-none px-4"
                                            value={formData.severity}
                                            onChange={(e) => updateForm('severity', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Upload Photos</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        {imageUrls.map((img, i) => (
                                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border">
                                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(i)}
                                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-6 h-6 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="aspect-square rounded-2xl bg-muted/50 border-2 border-dashed border-muted flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                                            <Plus className="w-8 h-8 text-muted-foreground mb-1" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Add Photo</span>
                                            <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location Pin</Label>
                                    <div className="h-40 rounded-2xl bg-muted/50 border-none flex flex-col items-center justify-center p-6 text-center">
                                        <MapPin className={cn("w-10 h-10 mb-2", formData.latitude ? "text-green-500" : "text-primary")} />
                                        {formData.latitude ? (
                                            <>
                                                <p className="font-bold text-sm text-green-600">Location captured!</p>
                                                <p className="text-xs text-muted-foreground">{formData.latitude.toFixed(4)}, {formData.longitude?.toFixed(4)}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-bold text-sm">Capture GPS coordinates</p>
                                                <p className="text-xs text-muted-foreground">Automatically link current location to report</p>
                                            </>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-4 rounded-xl border-none shadow-sm h-10 px-6 font-bold"
                                            onClick={handleGetLocation}
                                        >
                                            {formData.latitude ? "Update Location" : "Enable Geolocation"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="p-8 pt-6 flex items-center justify-between border-t border-muted bg-muted/20">
                        <Button
                            variant="ghost"
                            className="rounded-2xl h-12 px-6 font-bold"
                            onClick={handleBack}
                            disabled={step === 1 || isSubmitting}
                        >
                            <ChevronLeft className="mr-2 w-4 h-4" />
                            Back
                        </Button>
                        {step < 3 ? (
                            <Button
                                className="rounded-2xl h-12 px-8 font-bold"
                                onClick={handleNext}
                            >
                                Next Step
                                <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                className="rounded-2xl h-12 px-8 font-bold"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.vin || !formData.make}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                Submit Report
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </DashboardLayout>
    );
}
