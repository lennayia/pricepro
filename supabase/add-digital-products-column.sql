-- Add digital_products column to time_entries table
-- This adds support for tracking time spent on creating digital products and services

ALTER TABLE pricepro.time_entries
ADD COLUMN IF NOT EXISTS digital_products NUMERIC(4,2) DEFAULT 0 CHECK (digital_products >= 0 AND digital_products <= 24);

COMMENT ON COLUMN pricepro.time_entries.digital_products IS 'Hodiny strávené tvorbou digiproduktů a služeb (kurzy, e-booky, produkty)';

-- Update existing rows to have 0 hours for this new category
UPDATE pricepro.time_entries
SET digital_products = 0
WHERE digital_products IS NULL;
