-- =============================================
-- AVV System - Database Schema Update
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================

-- Add missing columns to reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS latitude double precision DEFAULT NULL,
ADD COLUMN IF NOT EXISTS longitude double precision DEFAULT NULL,
ADD COLUMN IF NOT EXISTS severity text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS accident_date date DEFAULT NULL;

-- Ensure all required columns exist (safe to run multiple times)
DO $$ 
BEGIN
    -- Check and add vehicle_vin if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reports' AND column_name = 'vehicle_vin') THEN
        ALTER TABLE reports ADD COLUMN vehicle_vin text;
    END IF;
    
    -- Check and add vehicle_plate if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reports' AND column_name = 'vehicle_plate') THEN
        ALTER TABLE reports ADD COLUMN vehicle_plate text;
    END IF;
    
    -- Check and add vehicle_make if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reports' AND column_name = 'vehicle_make') THEN
        ALTER TABLE reports ADD COLUMN vehicle_make text;
    END IF;
    
    -- Check and add vehicle_model if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reports' AND column_name = 'vehicle_model') THEN
        ALTER TABLE reports ADD COLUMN vehicle_model text;
    END IF;
    
    -- Check and add description if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reports' AND column_name = 'description') THEN
        ALTER TABLE reports ADD COLUMN description text;
    END IF;
    
    -- Check and add contributor_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reports' AND column_name = 'contributor_id') THEN
        ALTER TABLE reports ADD COLUMN contributor_id uuid REFERENCES auth.users(id);
    END IF;
    
    -- Check and add status if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reports' AND column_name = 'status') THEN
        ALTER TABLE reports ADD COLUMN status text DEFAULT 'pending';
    END IF;
END $$;

-- Verify the schema (this will show current columns)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reports' 
ORDER BY ordinal_position;
