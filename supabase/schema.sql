-- Create OTP verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT otp_verifications_email_key UNIQUE (email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  auth_method VARCHAR(50) DEFAULT 'otp',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add RLS (Row Level Security) policies - optional but recommended
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to do everything
CREATE POLICY "Service role can do everything on otp_verifications"
  ON otp_verifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to automatically delete expired OTPs (optional cleanup job)
CREATE OR REPLACE FUNCTION delete_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- You can set up a cron job to run this periodically:
-- SELECT cron.schedule('delete-expired-otps', '*/10 * * * *', 'SELECT delete_expired_otps();');
