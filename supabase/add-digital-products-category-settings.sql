-- Add digital_products category settings for existing users
-- This should be run AFTER add-digital-products-column.sql
-- This adds the new category to existing users' category settings

INSERT INTO pricepro.user_category_settings (user_id, category_key, category_type, display_order)
SELECT
  u.id as user_id,
  'digital_products' as category_key,
  'other' as category_type, -- Default to 'other', users can change to 'scalable' if appropriate
  8 as display_order
FROM pricepro.users u
WHERE NOT EXISTS (
  SELECT 1
  FROM pricepro.user_category_settings ucs
  WHERE ucs.user_id = u.id AND ucs.category_key = 'digital_products'
)
ON CONFLICT (user_id, category_key) DO NOTHING;

-- Also update the display_order of 'other' category to 9 for all users
UPDATE pricepro.user_category_settings
SET display_order = 9
WHERE category_key = 'other' AND display_order = 8;

-- Verify migration
SELECT
  u.email,
  COUNT(ucs.id) as settings_count,
  COUNT(CASE WHEN ucs.category_key = 'digital_products' THEN 1 END) as has_digital_products
FROM pricepro.users u
LEFT JOIN pricepro.user_category_settings ucs ON u.id = ucs.user_id
GROUP BY u.email
ORDER BY u.email;
