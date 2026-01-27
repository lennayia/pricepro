# PricePro - Master TODO

**Projekt**: Samostatná aplikace PricePro
**URL**: `pricepro.vibecodingpro.cz`
**Design**: Bronze/Gold (light) + Green (dark) - konzistentní s VibecodingPro
**Přístup**: MUI komponenty + Framer Motion animace + Lucide ikony
**Branch**: `main` (výchozí)

---

## 📊 Aktuální stav projektu

### ✅ HOTOVO - Core Foundation
- [x] Instalace dependencies (Framer Motion, Lucide React)
- [x] MUI theme upravený na bronze/gold/green barvy
- [x] Light/Dark theme varianty s ThemeContext
- [x] MUI komponenty přestylované (Card, Button, TextField)
- [x] ThemeToggle komponenta (slunce/měsíc ikona)
- [x] VibecodingPro vyčištěný (jen landing page)
- [x] CTA odkazy vedou na `pricepro.vibecodingpro.cz`

### ✅ HOTOVO - Authentication
- [x] AuthContext s Supabase integrací
- [x] RegisterPage (email + heslo + Google OAuth)
- [x] LoginPage (email + heslo + Google OAuth)
- [x] ProtectedRoute / AuthGuard
- [x] Google OAuth flow funkční
- [x] Supabase `pricepro.users` tabulka s RLS policies
- [x] GRANT permissions správně nastavené

### ✅ HOTOVO - Time Tracker Module (KOMPLETNÍ)
- [x] Database: `pricepro.time_entries` tabulka
  - [x] RLS policies
  - [x] Work categories (8 typů)
  - [x] Personal life categories (3 typy: spánek, rodina, osobní čas)
  - [x] SQL migrace: `supabase_migration_time_entries_fix.sql`
  - [x] SQL migrace: `supabase_add_personal_life_columns.sql`
- [x] Service layer: `services/timeEntries.js`
  - [x] CRUD operace (getTimeEntries, getTimeEntry, upsertTimeEntry)
- [x] Utility moduly:
  - [x] `utils/dateHelpers.js` - práce s daty
  - [x] `utils/calculators.js` - výpočty hodin a průměrů
  - [x] `utils/healthScore.js` - health score logika
  - [x] `utils/formatters.js` - formátování čísel
- [x] Constants moduly:
  - [x] `constants/colors.js` - jednotná barevná paleta
  - [x] `constants/icons.js` - Lucide ikony mapování
  - [x] `constants/categories.js` - centrální definice kategorií
  - [x] `constants/healthThresholds.js` - doporučené hodnoty
- [x] TrackerPage - výběr dne (1-7) + progress tracking
- [x] TrackerDayPage - zadání aktivit a hodin + real-time validation
- [x] TrackerResultsPage - souhrn týdne s vizualizacemi
  - [x] Health Score (0-100%) s work-life balance metrikami
  - [x] Personalizovaná doporučení
  - [x] Recharts grafy (pie chart, bar chart)
  - [x] Detailní tabulka s percentuálními poměry
- [x] Refaktoring: Všechny MUI ikony → Lucide ikony
- [x] Refaktoring: ~300 řádků duplicitního kódu eliminováno

### ✅ HOTOVO - Calculator Module (KOMPLETNÍ)
- [x] Database: `pricepro.calculator_results` tabulka
  - [x] RLS policies
  - [x] JSONB pro uložení vstupů
  - [x] SQL migrace: `supabase_calculator_results.sql`
- [x] Service layer: `services/calculatorResults.js`
  - [x] CRUD operace (save, get, getLatest, delete, update)
- [x] CalculatorPage - multi-step formulář (3 kroky):
  1. [x] Životní náklady (bydlení, jídlo, business, spoření)
  2. [x] Reálný čas (týdenní hodiny, fakturovatelné hodiny)
  3. [x] Tržní hodnota (zkušenosti, specializace, portfolio, poptávka)
- [x] CalculatorResultsPage - 3 typy hodinovek:
  - [x] Minimální (pokrytí nákladů)
  - [x] Doporučená (s koeficienty)
  - [x] Prémiová (doporučená × 1.3)
  - [x] Argumenty pro vyšší cenu
  - [x] CTA na Vibecoding mentoring
- [x] Refaktoring: Všechny MUI ikony → Lucide ikony
- [x] Supabase integrace - ukládání výsledků

### ✅ HOTOVO - Text & Localization
- [x] Převod na formální vykání ve všech stránkách
  - [x] LandingPage
  - [x] DashboardPage
  - [x] TrackerPage, TrackerDayPage, TrackerResultsPage
  - [x] CalculatorPage, CalculatorResultsPage
  - [x] HistoryPage
  - [x] RegisterPage, LoginPage

### ✅ HOTOVO - Dashboard Page (KOMPLETNÍ)
- [x] Přehled aktuálního týdne (Tracker)
  - [x] Quick stats: vyplněné dny, celkové hodiny práce
  - [x] Health Score widget s barevným kódováním
  - [x] Progress bar zobrazující vyplněné dny
  - [x] Quick link "Vyplnit dnešní den"
- [x] Poslední kalkulace
  - [x] Zobrazení doporučené hodinovky
  - [x] Minimální a prémiová hodinovka
  - [x] Quick link "Nová kalkulace"
- [x] Quick actions cards
  - [x] Link na Tracker času
  - [x] Link na Kalkulačku
  - [x] Link na Historii
- [x] Tip card s doporučením workflow
- [x] Empty states pro oba moduly
- [x] Real-time data loading ze Supabase
- [x] Loading states a error handling

**Soubory**:
- ✅ `src/pages/app/DashboardPage.jsx` (kompletní)

### ✅ HOTOVO - History Page (KOMPLETNÍ)
- [x] Seznam předchozích kalkulací
  - [x] Datum vytvoření (Czech formát)
  - [x] Doporučená hodinovka zvýrazněná
  - [x] Minimální a prémiová hodinovka
  - [x] Možnost zobrazit detail (Eye icon)
  - [x] Možnost smazat (Trash icon)
- [x] Řazení podle data (nejnovější první)
- [x] Detail kalkulace v dialogu
  - [x] 3 price cards (minimální, doporučená, prémiová)
  - [x] Shrnutí (měsíční příjem, hodiny, koeficient)
  - [x] Zobrazení všech vstupů
- [x] Delete confirmation dialog
  - [x] Preview kalkulace před smazáním
  - [x] Loading state při mazání
- [x] Empty state s CTA na kalkulačku
- [x] Error handling s Alert
- [x] Lucide ikony konzistentně
- [x] Czech date/currency formatting

**Soubory**:
- ✅ `src/pages/app/HistoryPage.jsx` (kompletní - 438 řádků)

---

## 🚧 ZBÝVÁ DOKONČIT

### 🔄 Priority (v pořadí)

#### 1️⃣ Landing Page Redesign
**Stav**: Existuje základní landing, potřebuje vylepšení

**Co chybí**:
- [ ] Hero sekce
  - [ ] Catchier nadpis
  - [ ] Subtitle s value proposition
  - [ ] CTA "Začít zdarma" → `/registrace`
- [ ] Problem/Solution sekce
  - [ ] "Kolik vlastně stojíš?"
  - [ ] "Nezahořívám?"
- [ ] Features (3 karty)
  - [ ] Time Tracker - "Sleduj svůj čas a work-life balance"
  - [ ] Cenová kalkulačka - "Zjisti svou reálnou hodnotu"
  - [ ] Historie - "Porovnej své výpočty v čase"
- [ ] How it works (3 kroky)
  - [ ] Registrace zdarma
  - [ ] Vyplň tracker a kalkulačku
  - [ ] Získej personalizované výsledky
- [ ] Social proof / testimonials (pokud máme)
- [ ] Final CTA
  - [ ] "Začni trackovat svůj čas zdarma"

**Soubory**:
- `src/pages/LandingPage.jsx` (upravit)
- Použít Framer Motion pro animace

---

#### 4️⃣ Testing & Bug Fixes
**Co otestovat**:
- [ ] Time Tracker end-to-end
  - [ ] Vyplnit všech 7 dní
  - [ ] Ověřit výpočty health score
  - [ ] Zkontrolovat doporučení
  - [ ] Test s neúplným týdnem
- [ ] Calculator end-to-end
  - [ ] Vyplnit všechny 3 kroky
  - [ ] Ověřit výpočty hodinovky
  - [ ] Ukládání do DB
  - [ ] Zobrazení v historii
- [ ] Auth flow
  - [ ] Registrace email + heslo
  - [ ] Google OAuth
  - [ ] Odhlášení
  - [ ] Protected routes
- [ ] Theme switching
  - [ ] Light → Dark přepínání
  - [ ] Persistence v localStorage

---

#### 5️⃣ Polish & UX Improvements
**Nice-to-have vylepšení**:
- [ ] Loading states všude konzistentní
- [ ] Error handling všude jednotný
- [ ] Toast notifications (místo Alert?)
- [ ] Empty states vylepšit
  - [ ] Tracker: "Začněte trackovat svůj čas"
  - [ ] Calculator: "Spočítejte svou hodinovku"
  - [ ] History: "Zatím nemáte žádné kalkulace"
- [ ] Animace s Framer Motion
  - [ ] Page transitions
  - [ ] Card hover effects
  - [ ] Button interactions
- [ ] Responsive design ověřit
  - [ ] Mobile (< 640px)
  - [ ] Tablet (640-1024px)
  - [ ] Desktop (> 1024px)

---

#### 6️⃣ Deployment na Vercel
**URL**: `pricepro.vibecodingpro.cz`

**Úkoly**:
- [ ] Push finální verze na `main` branch
- [ ] Vytvořit projekt na Vercel
  - [ ] Import z GitHub
  - [ ] Auto-deploy z main
- [ ] Přidat custom domain: `pricepro.vibecodingpro.cz`
- [ ] Nastavit DNS (CNAME na cname.vercel-dns.com)
- [ ] Environment variables na Vercelu:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Build a deploy
- [ ] Aktualizovat Supabase redirect URLs:
  - [ ] `https://pricepro.vibecodingpro.cz/app`
  - [ ] `http://localhost:5173/app` (dev)
- [ ] Otestovat na produkci

**⏱️ Odhadovaný čas**: ~20-30 minut

---

## 🔧 Technické detaily

**Stack**:
- React 19
- Vite 6
- MUI 7
- Framer Motion
- Lucide React (ikony)
- Recharts (grafy)
- Supabase (auth + database)

**Supabase**:
- URL: `https://qrnsrhrgjzijqphgehra.supabase.co`
- Schema: `pricepro`
- Tabulky:
  - `pricepro.users` - user profiles
  - `pricepro.time_entries` - tracker data
  - `pricepro.calculator_results` - calculator history

**Git**:
- Main branch: `main`
- Remote: `origin/main`
- Repo: `https://github.com/lennayia/pricepro.git`

---

## 📈 Progress Overview

**Dokončeno**: ~90%
- ✅ Core Foundation (100%)
- ✅ Authentication (100%)
- ✅ Time Tracker (100%)
- ✅ Calculator (100%)
- ✅ Dashboard (100%) ⭐
- ✅ History (100%) ⭐
- 🔄 Landing Page (50%)
- ⏳ Testing (0%)
- ⏳ Deployment (0%)

---

## 🎯 Další kroky

**Immediate (dnes)**:
1. ✅ ~~Dashboard implementace (widgets, quick actions)~~ HOTOVO
2. ✅ ~~History page implementace (seznam kalkulací, detail)~~ HOTOVO
3. Testing obou modulů (Tracker + Calculator)

**Short-term (tento týden)**:
4. Landing page redesign (hero, features, how it works)
5. Polish & UX improvements (animace, loading states)
6. Deployment na Vercel (pricepro.vibecodingpro.cz)

**Long-term (budoucí featury)**:
- Export dat (CSV, PDF)
- Týdenní/měsíční přehledy
- Porovnání s předchozími týdny
- Cíle a sledování progress
- Integrace s kalendářem
- Mobile app (PWA)

---

## 📚 Reference

### Dokumentace:
- Supabase Auth: https://supabase.com/docs/guides/auth
- MUI v7: https://mui.com/material-ui/
- Recharts: https://recharts.org/
- Framer Motion: https://www.framer.com/motion/

### Použité soubory jako reference:
- VibecodingPro ThemeContext: `/Users/lenkaroubalova/Documents/digivesmir/vibecoding/claude-code-sales/src/contexts/ThemeContext.jsx`
- VibecodingPro AuthContext (pro inspiraci)

### Design:
- Bronze: `#CD7F32`
- Gold: `#FFD700`
- Copper: `#A0522D`
- Green (dark): `#0DDD0D`

---

## 🐛 Známé problémy

**Žádné aktivní problémy!** 🎉

Všechny předchozí problémy (GRANT permissions, RLS policies, UPSERT) byly vyřešeny.

---

## 🎊 Úspěchy

- ✅ Time Tracker s work-life balance metrikami
- ✅ Health Score (0-100%) s personalizovanými doporučeními
- ✅ Cenová kalkulačka s 3 typy hodinovek
- ✅ Kompletní refaktoring (300+ řádků duplicit odstraněno)
- ✅ Jednotný design systém (Lucide ikony, centralizované konstanty)
- ✅ Supabase integrace pro oba moduly
- ✅ Formální vykání konzistentně všude
- ✅ **Dashboard s real-time daty a quick actions** ⭐
- ✅ **History page s detailem a mazáním kalkulací** ⭐

**Aplikace je plně funkční a připravená k testování a nasazení!** 🚀
