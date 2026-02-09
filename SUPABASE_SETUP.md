# Supabase Setup Guide for AVV System

Follow these steps to configure your Supabase backend to work with the frontend.

## 1. Database Schema

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create User Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'contributor', 'subscriber')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Accident Reports table
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contributor_id UUID REFERENCES profiles(id),
  vehicle_vin TEXT NOT NULL,
  vehicle_plate TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  description TEXT,
  location_lat FLOAT,
  location_lng FLOAT,
  location_address TEXT,
  accident_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Report Images table
CREATE TABLE report_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Earnings table (for Contributors)
CREATE TABLE earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  report_id UUID REFERENCES reports(id),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. Storage Buckets

Create the following bucket in Supabase Storage:

1. **Bucket Name**: `accident-images`
   - **Public**: `true`
   - **Policy**: Allow `INSERT` for authenticated users with role `contributor`. Allow `SELECT` for all.

## 3. Row Level Security (RLS)

### Profiles
- `SELECT`: Users can read their own profile. Admins can read all.
- `UPDATE`: Users can update their own profile.

### Reports
- `SELECT`: All authenticated users.
- `INSERT`: Only `contributor` role.
- `UPDATE/DELETE`: Only the owner or `admin`.

## 4. Auth Configuration

- **Providers**: Enable Email/Password.
- **Site URL**: `http://localhost:3000` (for local development).
- **Email Confirmation**: Disable for faster testing during initial development.

## 5. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
