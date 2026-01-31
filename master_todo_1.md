# 📋 PricePro - Kompletní přehled funkcí (aktuální stav)

## 🎯 Základní koncept
Webová aplikace pro OSVČ a podnikatelky, která pomáhá správně nacenit služby na základě reálného času a nákladů.

---

## ✅ Implementované funkce

### 1. **Autentizace & Uživatelské účty**
- ✅ Registrace (email + heslo)
- ✅ Přihlášení
- ✅ Odhlášení
- ✅ Supabase auth + RLS
- ✅ Protected routes
- ✅ User context

### 2. **Dashboard**
- ✅ Přehledová stránka po přihlášení
- ✅ Odkazy na hlavní funkce (Tracker, Kalkulačka, Historie)

### 3. **Time Tracker (sledování času)**

#### 3A. Základní tracking:
- ✅ 7-denní tracker (Pondělí - Neděle)
- ✅ 11 kategorií aktivit:
  - **Pracovní (8):** Komunikace s klienty, Tvorba obsahu, Sociální sítě, Administrativa, Zprávy, Vzdělávání, Fakturovatelná práce, Ostatní
  - **Osobní (3):** Spánek, Rodina & přátelé, Osobní čas
- ✅ Ukládání hodin do Supabase
- ✅ Validace (max 24h/den)
- ✅ Live feedback (balanc, přetížení, nedostatek spánku)

#### 3B. Pokročilé funkce trackeru:
- ✅ **Nastavitelné kategorie** (3 typy):
  - 💼 **Fakturovatelná** = 1:1 klientská práce (pro kalkulačku hodinovky)
  - 📈 **Škálovatelná** = Investice do produktů/kurzů (pasivní příjem)
  - 🔧 **Ostatní** = Režie, administrativa
- ✅ Stránka `/app/nastaveni/kategorie` pro klasifikaci
- ✅ **Správa projektů/klientů:**
  - Vytváření projektů s názvem a barvou
  - Přiřazení projektu KE KAŽDÉ kategorii zvlášť (ne jen jeden projekt/den)
  - Stránka `/app/nastaveni/projekty`
- ✅ **Responzivní UI:**
  - Mobil (≤600px): 2řádkový layout
  - Desktop: vše vedle sebe s popisem

#### 3C. Reporting:
- ✅ **TrackerResultsPage** s breakdown:
  - 3 karty: Fakturovatelné / Škálovatelné / Ostatní hodiny
  - Health Score (0-100%) work-life balance
  - Grafy: Pie chart (rozdělení času), Bar chart (fakturovatelná práce)
  - **Tabulka breakdown po projektech** (kolik hodin pro kterého klienta)
  - Personalizovaná doporučení
- ✅ Link na úpravu klasifikace kategorií

### 4. **Kalkulačka hodinovky**

#### Krok 1: Životní náklady
- ✅ Input: Bydlení, Životní náklady, Náklady na podnikání, Spoření
- ✅ Auto +15% daně
- ✅ Výpočet minimálního měsíčního příjmu

#### Krok 2: Reálný čas
- ✅ **AUTO-NAČTENÍ z trackeru** (POUZE fakturovatelné hodiny, NE škálovatelné!)
- ✅ Zobrazení breakdownu: pracovní vs fakturovatelné hodiny
- ✅ Linky: Upravit tracker | Změnit fakturovatelné kategorie
- ✅ Fallback na manuální input (když nejsou tracker data)
- ✅ Přepínač manuálního režimu
- ✅ Výpočet minimální hodinovky

#### Krok 3: Tržní hodnota
- ✅ Koeficienty:
  - Zkušenosti (1.0 - 1.5×)
  - Specializace (1.0 - 1.3×)
  - Portfolio (1.0 - 1.2×)
  - Poptávka (1.0 - 1.4×)
- ✅ Výpočet doporučené hodinovky
- ✅ Výpočet premium hodinovky (+30%)

#### Výsledky kalkulačky:
- ✅ 3 ceny: Minimální (červená) | Doporučená (zelená) | Premium (zlatá)
- ✅ Argumenty pro vyšší cenu
- ✅ **PassiveIncomeInsight komponenta:**
  - Rozbalovací sekce "Máte pasivní příjem?"
  - Input měsíční pasivní příjem
  - Výpočet: Kolik hodin ušetříte (bez změny hodinovky!)
  - Důležité vysvětlení: Hodinovka zůstává, jen potřebujete méně 1:1 hodin
  - Tip na sledování škálovatelných hodin v trackeru
- ✅ Ukládání výsledků do DB
- ✅ CTA na Vibecoding mentoring

### 5. **Historie výpočtů**
- ✅ HistoryPage - seznam předchozích kalkulací
- ✅ Možnost načíst staré výpočty

### 6. **Navigace & Layout**
- ✅ Boční menu (desktop) / drawer (mobil)
- ✅ Submenu s timeline pro Tracker (Den 1-7, Výsledky)
- ✅ Submenu pro Kalkulačku (Krok 1-3, Výsledky)
- ✅ Avatar menu s:
  - Email uživatele
  - Nastavení kategorií
  - Správa projektů
  - Odhlásit se
- ✅ ThemeToggle (light/dark mode)

### 7. **Design & Styling**
- ✅ Material-UI komponenty
- ✅ Responzivní design (mobil first)
- ✅ Bronzová/zlatá paleta (light mode)
- ✅ Neonově zelená paleta (dark mode)
- ✅ České texty
- ✅ Info/warning/error karty s jednotným stylem

---

## 🗄️ Databáze (Supabase)

### Schéma `pricepro`:
1. **`users`** - Uživatelé (trigger z auth.users)
2. **`time_entries`** - Záznamy času
   - Sloupce pro 11 kategorií (hours)
   - `category_projects` (JSONB) - mapování kategorií → projekt ID
   - `project_name` (TEXT, deprecated) - legacy pole
3. **`calculator_results`** - Výsledky kalkulací
4. **`user_category_settings`** - Klasifikace kategorií (billable/scalable/other)
5. **`projects`** - Projekty/klienti uživatele (název, barva, archivováno)

### RLS policies:
- ✅ Users can only see/edit their own data
- ✅ Row Level Security na všech tabulkách

---

## 📂 Struktura projektu

```
src/
├── components/
│   ├── layout/          (AppLayout, PublicLayout)
│   ├── ui/              (ResponsiveButton, ThemeToggle, NumberInput...)
│   ├── common/          (ProtectedRoute, RootRedirect)
│   └── calculator/      (PassiveIncomeInsight)
├── pages/
│   ├── auth/            (LoginPage, RegisterPage)
│   └── app/
│       ├── DashboardPage.jsx
│       ├── HistoryPage.jsx
│       ├── tracker/     (TrackerPage, TrackerDayPage, TrackerResultsPage)
│       ├── calculator/  (CalculatorPage, CalculatorResultsPage)
│       └── settings/    (CategorySettingsPage, ProjectsSettingsPage)
├── services/
│   ├── supabase.js
│   ├── timeEntries.js
│   ├── calculatorResults.js
│   ├── categorySettings.js
│   └── projects.js
├── utils/
│   ├── dateHelpers.js
│   ├── calculators.js
│   ├── formatters.js
│   ├── healthScore.js
│   └── billableHoursCalculator.js
├── constants/
│   ├── categories.js
│   ├── colors.js
│   ├── icons.js
│   └── healthThresholds.js
└── contexts/
    ├── AuthContext.jsx
    └── ThemeContext.jsx
```

---

## 🎨 UX Features
- ✅ Loading states
- ✅ Error handling s českými hláškami
- ✅ Success messages s auto-dismiss
- ✅ Validace formulářů
- ✅ Disabled states při ukládání
- ✅ Tooltips a helper texty
- ✅ Responsive breakpoints (xs, sm, md, lg)
- ✅ Prázdné stavy (empty states) s CTA
- ✅ Info karty s ikonami
- ✅ Zpětné linky (breadcrumbs)

---

## 🔑 Klíčová logika

### Rozdíl mezi typy práce:
- **Fakturovatelná (billable):** 1:1 klientská práce → počítá se do kalkulačky hodinovky
- **Škálovatelná (scalable):** Investice do produktů → NEpočítá se do hodinovky, sleduje se zvlášť
- **Ostatní (other):** Režie → NEpočítá se do hodinovky

### Pasivní příjem:
- **NEOVLIVŇUJE hodinovku!**
- Jen snižuje potřebné množství fakturovatelných hodin
- Uživatel si zachová stejnou hodnotu práce (např. 500 Kč/h), jen nepotřebuje tolik 1:1 hodin

---

## 📱 Routing

```
/                          → RootRedirect (→ /prihlaseni nebo /app)
/prihlaseni                → LoginPage
/registrace                → RegisterPage
/app                       → DashboardPage (protected)
/app/tracker               → TrackerPage
/app/tracker/den/:dayNumber → TrackerDayPage
/app/tracker/vysledky      → TrackerResultsPage
/app/kalkulacka            → CalculatorPage
/app/kalkulacka/vysledky   → CalculatorResultsPage
/app/historie              → HistoryPage
/app/nastaveni/kategorie   → CategorySettingsPage
/app/nastaveni/projekty    → ProjectsSettingsPage
```

---

## 🚧 Co NENÍ implementováno (náměty na další vývoj)

- ❌ Real-time tracker (Start/Stop timer jako Toggl)
- ❌ Export dat (CSV, PDF)
- ❌ Emailové notifikace
- ❌ Multi-týdenní reporting (porovnání týdnů)
- ❌ Fakturace / invoicing
- ❌ Integrace s kalendářem
- ❌ Team collaboration
- ❌ API pro třetí strany
- ❌ Automatické autocomplete projektů v trackeru
- ❌ Archivace starých projektů v UI
- ❌ Měsíční/roční přehledy
- ❌ Goals & targets

---

## 🐛 Známé problémy / TODO

*(sem můžeš přidávat věci, které najdeš při testování)*

- [ ] Otestovat SQL migrace na čistém účtu
- [ ] Otestovat mobil layout na reálném zařízení
- [ ] Ověřit, že projekt dropdown funguje jen když má kategorie hodiny > 0

---

**Poslední update:** 30. ledna 2026
**Status:** ✅ Plně funkční, production-ready pro základní workflow

---

**Pro další vývoj s AI:** Tento dokument obsahuje kompletní přehled toho, co PricePro UMÍ. Použij ho jako kontext, abys nevymýšlel věci, které už existují!
