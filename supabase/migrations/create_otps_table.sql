-- Create OTP verifications table for email-based one-time password authentication
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast lookup by email
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON public.otp_verifications(email);

-- Create index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON public.otp_verifications(expires_at);

-- Add comment
COMMENT ON TABLE public.otp_verifications IS 'Stores hashed one-time passwords for email authentication';
