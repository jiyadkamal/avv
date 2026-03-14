export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export enum AccountTier {
    FREE = 'free',
    PREMIUM = 'premium',
    PRO = 'pro',
}

export enum WorkshopStatus {
    NONE = 'none',
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum ReportStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    account_tier: AccountTier;
    is_workshop: boolean;
    workshop_status: WorkshopStatus;
    gst_number?: string;
    avatar_url?: string;
    created_at: string;
}

export interface Workshop {
    id: string;
    owner_id: string;
    name: string;
    state: string;
    district: string;
    description: string;
    gst_number: string;
    workshop_image?: string;
    verification_status: WorkshopStatus;
    images: string[];
    created_at: string;
    updated_at?: string;
}

export interface AccidentReport {
    id: string;
    contributor_id: string;
    vehicle_vin: string;
    vehicle_plate: string;
    vehicle_make: string;
    vehicle_model: string;
    description: string;
    severity?: string;
    location_lat?: number;
    location_lng?: number;
    location_address?: string;
    accident_date: string;
    status: ReportStatus;
    // Workshop-specific fields
    service_details?: string;
    replaced_parts?: string;
    invoice_url?: string;
    created_at: string;
    updated_at?: string;
    images?: string[];
}

export interface ReportImage {
    id: string;
    report_id: string;
    url: string;
    created_at: string;
}

export interface Earning {
    id: string;
    profile_id: string;
    amount: number;
    reason: string;
    report_id?: string;
    created_at: string;
}
