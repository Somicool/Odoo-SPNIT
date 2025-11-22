-- ============================================
-- MISSING TABLES AND COLUMNS - RUN THIS SQL
-- ============================================

-- 1. CREATE otp_verifications table (CRITICAL for login)
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for otp_verifications
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON public.otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON public.otp_verifications(expires_at);

COMMENT ON TABLE public.otp_verifications IS 'Stores hashed one-time passwords for email authentication';

-- ============================================

-- 2. ADD short_code column to warehouses
ALTER TABLE public.warehouses 
ADD COLUMN IF NOT EXISTS short_code VARCHAR(50);

-- Make short_code unique
CREATE UNIQUE INDEX IF NOT EXISTS warehouses_short_code_unique ON public.warehouses(short_code) WHERE short_code IS NOT NULL;

-- ============================================

-- 3. ADD short_code column to locations
ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS short_code VARCHAR(50);

-- ============================================

-- 4. ADD missing columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS on_hand INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_to_use INTEGER DEFAULT 0;

-- ============================================

-- 5. ADD missing columns to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS responsible TEXT;

-- ============================================

-- 6. ENABLE Row Level Security (optional but recommended)
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Service role can do everything on otp_verifications" ON public.otp_verifications;

-- Create policy to allow service role to manage OTP verifications
CREATE POLICY "Service role can do everything on otp_verifications"
  ON public.otp_verifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================

-- 7. CREATE function to cleanup expired OTPs (optional)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_verifications WHERE expires_at < NOW();
END;
$$;

-- ============================================
-- VERIFICATION QUERIES (Run these to check)
-- ============================================

-- Check if otp_verifications table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'otp_verifications'
);

-- Check warehouses columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'warehouses'
ORDER BY ordinal_position;

-- Check locations columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'locations'
ORDER BY ordinal_position;

-- Check products columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- Check documents columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'documents'
ORDER BY ordinal_position;

-- ============================================
-- SUMMARY OF WHAT THIS ADDS:
-- ============================================
-- ✅ otp_verifications table (for OTP login)
-- ✅ warehouses.short_code column
-- ✅ locations.short_code column  
-- ✅ products.unit_cost column
-- ✅ products.on_hand column
-- ✅ products.free_to_use column
-- ✅ documents.scheduled_date column
-- ✅ documents.responsible column
-- ✅ RLS policies for security
-- ✅ Cleanup function for expired OTPs
-- ============================================
