-- Initialize category settings for existing users who don't have any yet
-- This migration should be run after creating the user_category_settings table

INSERT INTO pricepro.user_category_settings (user_id, category_key, category_type, display_order)
SELECT
  u.id as user_id,
  category.key as category_key,
  CASE
    WHEN category.key = 'billable_work' THEN 'billable'
    ELSE 'other'
  END as category_type, -- Only billable_work is billable by default, rest is 'other'
  category.display_order as display_order
FROM pricepro.users u
CROSS JOIN (
  VALUES
    ('client_communication', 1),
    ('content_creation', 2),
    ('social_media', 3),
    ('administration', 4),
    ('messages', 5),
    ('education', 6),
    ('billable_work', 7),
    ('digital_products', 8),
    ('other', 9)
) AS category(key, display_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM pricepro.user_category_settings ucs
  WHERE ucs.user_id = u.id AND ucs.category_key = category.key
)
ON CONFLICT (user_id, category_key) DO NOTHING;

-- Verify migration
SELECT
  u.email,
  COUNT(ucs.id) as settings_count
FROM pricepro.users u
LEFT JOIN pricepro.user_category_settings ucs ON u.id = ucs.user_id
GROUP BY u.email
ORDER BY u.email;
