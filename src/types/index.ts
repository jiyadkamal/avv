export enum UserRole {
    ADMIN = 'admin',
    CONTRIBUTOR = 'contributor',
    SUBSCRIBER = 'subscriber',
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
    avatar_url?: string;
    created_at: string;
}

export interface AccidentReport {
    id: string;
    contributor_id: string;
    vehicle_vin: string;
    vehicle_plate: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number;
    description: string;
    location_lat: number;
    location_lng: number;
    location_address: string;
    accident_date: string;
    status: ReportStatus;
    created_at: string;
    updated_at: string;
    images?: ReportImage[];
}

export interface ReportImage {
    id: string;
    report_id: string;
    url: string;
    created_at: string;
}
