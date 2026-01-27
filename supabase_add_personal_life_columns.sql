-- Add personal life tracking columns to time_entries table
ALTER TABLE pricepro.time_entries
ADD COLUMN IF NOT EXISTS sleep DECIMAL(4,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS family_time DECIMAL(4,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS personal_time DECIMAL(4,2) DEFAULT 0;

COMMENT ON COLUMN pricepro.time_entries.sleep IS 'Hodiny spánku (doporučeno 7-8h)';
COMMENT ON COLUMN pricepro.time_entries.family_time IS 'Čas s rodinou a přáteli';
COMMENT ON COLUMN pricepro.time_entries.personal_time IS 'Osobní čas (koníčky, sport, relaxace)';
