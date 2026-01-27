# PricePro Supabase Setup

Tento průvodce vysvětluje, jak nastavit databázi pro PricePro v sdíleném Supabase projektu.

## 📋 Přehled

PricePro používá **separátní `pricepro` schéma** ve sdíleném Supabase projektu, aby byla data izolovaná od ostatních ProApp aplikací.

**Supabase projekt**: `qrnsrhrgjzijqphgehra.supabase.co`

## 🚀 Postup nastavení

### Krok 1: Vytvoření pricepro schématu

1. Otevřete [Supabase Dashboard](https://supabase.com/dashboard)
2. Vyberte projekt `qrnsrhrgjzijqphgehra`
3. Přejděte do **SQL Editor**
4. Spusťte soubor: `pricepro-schema.sql`

Toto vytvoří:
- `pricepro` schéma
- GRANT permissions pro `authenticated` a `anon` role
- Default privileges pro budoucí tabulky

### Krok 2: Vytvoření users tabulky

V SQL Editoru spusťte soubor: `pricepro-users-table.sql`

Toto vytvoří:
- `pricepro.users` tabulku
- GRANT permissions (KRITICKÉ!)
- RLS policies pro ochranu dat
- Trigger pro `updated_at`

### Krok 3: Vytvoření application tabulek

V SQL Editoru spusťte soubor: `pricepro-tables.sql`

Toto vytvoří:
- `pricepro.time_entries` (tracker času)
- `pricepro.calculator_data` (kalkulačka)
- GRANT permissions pro obě tabulky
- RLS policies pro ochranu dat
- Triggery pro `updated_at`

### Krok 4: Exponování pricepro schématu v API

1. V Supabase Dashboard přejděte do **Settings → API**
2. Najděte sekci **Exposed schemas**
3. Přidejte `pricepro` do seznamu exposed schemas
4. Uložte změny

⚠️ **Důležité**: Bez tohoto kroku bude API vracet HTTP 406 chyby!

### Krok 5: Nastavení Google OAuth

1. V Supabase Dashboard přejděte do **Authentication → Providers**
2. Zapněte **Google** provider
3. Vyplňte Google OAuth credentials (Client ID a Secret)
4. Přidejte **Redirect URLs**:
   - Development: `http://localhost:5173/app`
   - Production: `https://pricepro.vibecodingpro.cz/app`

### Krok 6: Ověření nastavení

Spusťte v SQL Editoru:

```sql
-- Ověř, že schéma existuje
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'pricepro';

-- Ověř tabulky
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'pricepro'
ORDER BY table_name;

-- Ověř permissions
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'pricepro' AND table_name = 'users';
```

Měly by se zobrazit:
- Schéma: `pricepro`
- Tabulky: `calculator_data`, `time_entries`, `users`
- Permissions: `authenticated` a `anon` s odpovídajícími právy

## 🗂️ Struktura databáze

### pricepro.users
Profily uživatelů PricePro
- `id` - UUID (reference na auth.users)
- `email` - Email uživatele
- `first_name`, `last_name`, `full_name` - Jméno
- `phone` - Telefon
- `marketing_consent` - Souhlas s marketingem
- `terms_accepted` - Souhlas s podmínkami

### pricepro.time_entries
Záznamy trackeru času (7 dní)
- `id` - UUID
- `user_id` - Reference na auth.users
- `date` - Datum záznamu
- Aktivity: `client_communication`, `content_creation`, `social_media`, `administration`, `messages`, `education`, `billable_work`, `other`

### pricepro.calculator_data
Historie výpočtů cenové kalkulačky
- `id` - UUID
- `user_id` - Reference na auth.users
- Vstupní data: náklady, čas, tržní faktory
- Vypočítané výsledky: minimální, doporučená, prémiová hodinovka

## ⚠️ Důležité poznámky

### GRANT permissions jsou KRITICKÉ!
RLS policies samy o sobě **NESTAČÍ**. Musíte explicitněGrantovat permissions:

```sql
GRANT ALL ON pricepro.users TO authenticated;
GRANT SELECT ON pricepro.users TO anon;
```

Bez tohoto dostanete HTTP 403 "permission denied for table".

### Exponování schématu v API
PostgREST API defaultně vidí pouze `public` schéma. Musíte přidat `pricepro` do exposed schemas v Settings → API.

### Použití UPSERT místo SELECT → INSERT
Pro eliminaci permission issues při vytváření profilu:

```javascript
// ✅ Dobře (UPSERT)
const { data, error } = await supabase
  .from('users')
  .upsert({ id: user.id, email: user.email })
  .select()
  .single();

// ❌ Špatně (SELECT → INSERT)
const { data: existing } = await supabase
  .from('users')
  .select()
  .eq('id', user.id)
  .single();

if (!existing) {
  await supabase.from('users').insert({ id: user.id, email: user.email });
}
```

## 🔗 Reference

- [Supabase Dashboard](https://supabase.com/dashboard/project/qrnsrhrgjzijqphgehra)
- [SQL Editor](https://supabase.com/dashboard/project/qrnsrhrgjzijqphgehra/sql)
- [Auth Settings](https://supabase.com/dashboard/project/qrnsrhrgjzijqphgehra/auth/providers)
- [API Settings](https://supabase.com/dashboard/project/qrnsrhrgjzijqphgehra/settings/api)
