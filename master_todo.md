# PricePro - Master TODO

**Projekt**: Samostatná aplikace PricePro
**URL**: `pricepro.vibecodingpro.cz`
**Design**: Bronze/Gold (light) + Green (dark) - konzistentní s VibecodingPro
**Přístup**: Hybrid - MUI komponenty + Framer Motion animace + Lucide ikony

---

## 📊 Aktuální stav

### ✅ Hotovo
- [x] Instalace dependencies (Framer Motion, Lucide React)
- [x] MUI theme upravený na bronze/gold/green barvy
- [x] Light/Dark theme varianty připravené
- [x] MUI komponenty přestylované (Card, Button, TextField)
- [x] VibecodingPro vyčištěný (jen landing page zůstala)
- [x] CTA odkazy vedou na `pricepro.vibecodingpro.cz`

### 🔧 Technické detaily
- **Stack**: React 19, Vite, MUI 7, Framer Motion, Supabase
- **Supabase URL**: `https://qrnsrhrgjzijqphgehra.supabase.co`
- **Schema**: `pricepro` (sdílený s ostatními ProApp projekty)
- **Branch**: `claude/create-app-foundation-Wpfmr`

---

## 🎯 Dnešní priority (v pořadí)

### 1️⃣ ThemeContext - Dark/Light mode switching
**Proč**: Uživatelé musí mít možnost přepínat mezi světlým a tmavým režimem

**Úkoly**:
- [ ] Vytvořit `src/contexts/ThemeContext.jsx`
  - useState pro theme mode ('light' | 'dark')
  - localStorage persistence
  - Provider component
- [ ] Přidat ThemeToggle komponentu (slunce/měsíc ikona)
- [ ] Integrovat do App.jsx s MUI ThemeProvider
- [ ] Otestovat přepínání a persistence

**Soubory k úpravě**:
- `src/contexts/ThemeContext.jsx` (nový)
- `src/App.jsx` (upravit)
- `src/main.jsx` (zkontrolovat)

**Reference**: VibecodingPro má podobný ThemeContext - můžeme se inspirovat

---

### 2️⃣ Auth integrace z VibecodingPro
**Proč**: Uživatelé musí mít možnost se registrovat a přihlásit

**Úkoly**:
- [ ] Zkopírovat `PriceProAuthContext.jsx` z VibecodingPro
  - UPSERT logika (ne SELECT → INSERT)
  - createPriceProProfile s user metadata
  - checkPriceProAccess
- [ ] Vytvořit `/src/pages/auth/RegisterPage.jsx`
  - Email + heslo registrace
  - Google OAuth button
  - Formulář s MUI komponenty
  - Framer Motion animace
- [ ] Vytvořit `/src/pages/auth/LoginPage.jsx`
  - Email + heslo přihlášení
  - Google OAuth button
- [ ] Vytvořit `/src/components/auth/GoogleButton.jsx`
  - Google OAuth flow
  - Redirect na `/app` po úspěchu
- [ ] Vytvořit `/src/components/common/ProtectedRoute.jsx`
  - AuthGuard pro chráněné stránky
- [ ] Aktualizovat routes v `App.jsx`
  - `/` - landing (LandingPage)
  - `/registrace` - RegisterPage
  - `/prihlaseni` - LoginPage
  - `/app/*` - protected routes (Dashboard, Tracker, Calculator, History)

**Soubory k vytvoření/upravit**:
- `src/contexts/PriceProAuthContext.jsx` (zkopírovat + upravit)
- `src/pages/auth/RegisterPage.jsx` (nový)
- `src/pages/auth/LoginPage.jsx` (nový)
- `src/components/auth/GoogleButton.jsx` (nový)
- `src/components/common/ProtectedRoute.jsx` (zkopírovat)
- `src/App.jsx` (upravit routes)

**Supabase config**:
- Už máme v `.env`: URL a ANON_KEY
- Vytvořit `src/services/supabase.js` s config:
  ```js
  db: { schema: 'pricepro' }
  ```

---

### 3️⃣ Supabase database setup
**Proč**: Auth potřebuje databázové tabulky

**Úkoly**:
- [ ] Vytvořit `supabase/pricepro-schema.sql` s:
  - `CREATE SCHEMA IF NOT EXISTS pricepro`
  - GRANT permissions
- [ ] Vytvořit `supabase/pricepro-users-table.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS pricepro.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    phone TEXT,
    marketing_consent BOOLEAN DEFAULT false,
    terms_accepted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- CRITICAL: GRANT permissions (RLS nestačí!)
  GRANT ALL ON pricepro.users TO authenticated;
  GRANT SELECT ON pricepro.users TO anon;

  -- RLS policies
  ALTER TABLE pricepro.users ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "authenticated_select" ON pricepro.users
    FOR SELECT TO authenticated USING (auth.uid() = id);

  CREATE POLICY "authenticated_insert" ON pricepro.users
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

  CREATE POLICY "authenticated_update" ON pricepro.users
    FOR UPDATE TO authenticated USING (auth.uid() = id);
  ```
- [ ] Spustit SQL v Supabase SQL Editor
- [ ] Přidat Google provider v Supabase Authentication → Providers
- [ ] Přidat redirect URLs:
  - `http://localhost:5173/app`
  - `https://pricepro.vibecodingpro.cz/app`

**⚠️ DŮLEŽITÉ POZNÁMKY Z VČEREJŠKA**:
- **GRANT permissions jsou KRITICKÉ** - RLS policies samy o sobě nestačí
- HTTP 403 "permission denied" = chybí GRANT
- Použít UPSERT místo SELECT → INSERT (obchází permission issues)

---

### 4️⃣ Převod na formální vykání
**Proč**: Konzistence s VibecodingPro (formální komunikace)

**Úkoly**:
- [ ] Projít všechny pages a změnit:
  - "ty/tvůj" → "vy/váš"
  - "děláš" → "děláte"
  - "jsi" → "jste"
  - "můžeš" → "můžete"
- [ ] Soubory k úpravě:
  - `src/pages/LandingPage.jsx`
  - `src/pages/app/DashboardPage.jsx`
  - `src/pages/app/tracker/TrackerPage.jsx`
  - `src/pages/app/calculator/CalculatorPage.jsx`
  - `src/pages/app/HistoryPage.jsx`
  - `src/pages/auth/RegisterPage.jsx`
  - `src/pages/auth/LoginPage.jsx`

**Tip**: Můžeme použít search & replace:
```
"ty " → "vy "
"Ty " → "Vy "
"tvůj" → "váš"
"tvoje" → "vaše"
"děláš" → "děláte"
"můžeš" → "můžete"
"jsi" → "jste"
"máš" → "máte"
"chceš" → "chcete"
```

---

### 5️⃣ Testování celého flow
**Proč**: Ověřit, že vše funguje před nasazením

**Úkoly**:
- [ ] Spustit dev server: `npm run dev`
- [ ] Otestovat registraci:
  - Email + heslo
  - Google OAuth
  - Kontrola v Supabase: `pricepro.users` tabulka
- [ ] Otestovat přihlášení:
  - Email + heslo
  - Google OAuth
  - Redirect na `/app`
- [ ] Otestovat odhlášení
- [ ] Otestovat protected routes (bez přihlášení → redirect na login)
- [ ] Otestovat theme switching (light/dark)

---

## 📋 Budoucí úkoly (po auth)

### 6️⃣ Tracker času (7 dní)
**Úkoly**:
- [ ] Database: `pricepro.time_entries` tabulka
- [ ] TrackerPage - výběr dne (1-7)
- [ ] TrackerDayPage - zadání aktivit a hodin
- [ ] TrackerResultsPage - souhrn 7 dní
- [ ] Vizualizace dat (Recharts grafy)

### 7️⃣ Cenová kalkulačka
**Úkoly**:
- [ ] Database: `pricepro.calculator_data` tabulka
- [ ] CalculatorPage - multi-step formulář:
  1. Životní náklady (bydlení, jídlo, doprava...)
  2. Reálný čas (pracovní hodiny, dovolená, nemoc...)
  3. Tržní hodnota (zkušenosti, specializace, portfolio...)
- [ ] CalculatorResultsPage - 3 typy hodinovek:
  - Minimální (pokrytí nákladů)
  - Doporučená (+ úspory)
  - Prémiová (+ investice)
- [ ] Vizualizace výsledků

### 8️⃣ Historie výpočtů
**Úkoly**:
- [ ] HistoryPage - seznam předchozích výpočtů
- [ ] Možnost zobrazit detail výpočtu
- [ ] Možnost smazat výpočet

### 9️⃣ Landing page redesign
**Úkoly**:
- [ ] Aktualizovat LandingPage.jsx
- [ ] Hero sekce s CTA "Začít zdarma"
- [ ] Problem/Solution sekce
- [ ] Features (3 karty: Tracker, Kalkulačka, Historie)
- [ ] How it works
- [ ] Benefits
- [ ] Final CTA

### 🔟 Deployment na Vercel (subdoména)
**URL**: `pricepro.vibecodingpro.cz`

**Úkoly**:
- [ ] Push kód na GitHub (nová branch nebo main)
- [ ] Vytvořit nový projekt na Vercel
- [ ] Import z GitHub repository
- [ ] Přidat custom domain v Vercel: `pricepro.vibecodingpro.cz`
- [ ] Nastavit DNS u registrátora vibecodingpro.cz:
  ```
  Type: CNAME
  Name: pricepro
  Value: cname.vercel-dns.com
  ```
- [ ] Přidat Environment Variables na Vercelu:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Build a deploy (automaticky po push)
- [ ] Otestovat na produkci: `https://pricepro.vibecodingpro.cz`
- [ ] Aktualizovat Supabase redirect URLs:
  - `https://pricepro.vibecodingpro.cz/app` (production)
  - `http://localhost:5173/app` (local dev)

**⏱️ Čas**: ~15-20 minut

---

## 🐛 Známé problémy z včerejška

### ❌ Problém: HTTP 403 "permission denied for table users"
**Příčina**: Chybějící GRANT permissions (RLS policies nestačí)
**Řešení**:
```sql
GRANT ALL ON pricepro.users TO authenticated;
GRANT SELECT ON pricepro.users TO anon;
```

### ❌ Problém: HTTP 406 při SELECT query
**Příčina**: PostgREST API nevidí `pricepro` schema
**Řešení**: Přidat do Supabase Settings → API → Exposed schemas: `pricepro`

### ❌ Problém: Profile se nevytváří při registraci
**Příčina**: SELECT permission issue při check `checkPriceProAccess`
**Řešení**: Použít UPSERT místo SELECT → INSERT

---

## 📚 Reference

### VibecodingPro soubory k inspiraci:
- `/Users/lenkaroubalova/Documents/digivesmir/vibecoding/claude-code-sales/src/contexts/ThemeContext.jsx`
- `/Users/lenkaroubalova/Documents/digivesmir/vibecoding/claude-code-sales/src/components/ui/ThemeToggle.jsx`

### Supabase dokumentace:
- Auth: https://supabase.com/docs/guides/auth
- RLS: https://supabase.com/docs/guides/auth/row-level-security
- OAuth: https://supabase.com/docs/guides/auth/social-login

### Design reference:
- VibecodingPro landing: `https://vibecodingpro.cz`
- Bronze: `#CD7F32`
- Gold: `#FFD700`
- Copper: `#A0522D`
- Green (dark): `#0DDD0D`

---

## 🎯 Úspěšný den = Hotové body 1-5
Po dokončení budeme mít:
✅ Funkční dark/light mode
✅ Kompletní auth (registrace + přihlášení + Google OAuth)
✅ Chráněné routes
✅ Formální vykání ve všech textech
✅ Otestovaný flow

**Pak můžeme začít s funkcionalitou (Tracker, Kalkulačka, Historie)** 🚀
