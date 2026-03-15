-- Migration: Add urutan column to qr_codes table
-- Date: 2026-03-15

-- Add urutan column to qr_codes table (INTEGER, not BIGINT, to avoid JSON serialization issues)
ALTER TABLE pengamanan.qr_codes
ADD COLUMN IF NOT EXISTS urutan INTEGER;

-- Add index for urutan column for better sorting performance
CREATE INDEX IF NOT EXISTS qr_codes_urutan_idx ON pengamanan.qr_codes(urutan);

COMMENT ON COLUMN pengamanan.qr_codes.urutan IS 'Urutan untuk pengurutan nama blok (INTEGER type, max value: 2,147,483,647)';
