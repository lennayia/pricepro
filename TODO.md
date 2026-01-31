# TODO - PricePro

## 🚨 KRITICKÉ - Databázové migrace
**MUSÍŠ SPUSTIT v Supabase SQL Editoru:**

### 1. Přidat client_id do projects
```sql
ALTER TABLE pricepro.projects
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES pricepro.clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON pricepro.projects(client_id);

COMMENT ON COLUMN pricepro.projects.client_id IS 'Optional reference to client - which client is this project for?';
```

### 2. Přidat category_project_clients do time_entries (pokud jsi ještě nespustila)
```sql
ALTER TABLE pricepro.time_entries
ADD COLUMN IF NOT EXISTS category_project_clients JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON pricepro.time_entries(client_id);

COMMENT ON COLUMN pricepro.time_entries.category_project_clients IS 'Mapping of category -> (projectId -> clientId). Structure: { "categoryKey": { "projectId": "clientId" } }';
```

---

## 📋 VELKÝ REFAKTORING - Změna logiky fakturovatelných hodin

### Kontext problému:
Současná logika je špatná:
- Typ práce (fakturovatelná/škálovatelná/ostatní) je na KATEGORII
- Ale jedna kategorie může být použita pro všechny typy práce!
- Příklad: "Tvorba obsahu" může být fakturovatelná (pro klienta), škálovatelná (můj kurz), nebo ostatní (můj marketing)

### Nová logika:
**Typ práce by měl být na PROJEKTU, ne na kategorii!**

### Co udělat:

#### 1. ❌ Odstranit CategorySettingsPage a její routing
- Smazat `/src/pages/app/settings/CategorySettingsPage.jsx`
- Odstranit z App.jsx route `/app/nastaveni/kategorie`
- Odstranit z AppLayout.jsx menu položku "Kategorie"
- Odstranit navigační chip "Kategorie" z ostatních settings pages

#### 2. ❌ Upravit TrackerResultsPage - počítat fakturovatelné hodiny podle typu PROJEKTU
**Soubor:** `/src/pages/app/tracker/TrackerResultsPage.jsx`

**Současná logika (ŠPATNĚ):**
- Načítá `user_category_settings` z databáze
- Sčítá hodiny podle toho, jaké kategorie má uživatel označené jako "billable"

**Nová logika (SPRÁVNĚ):**
- Načte všechny `projects` uživatele
- Pro každý projekt v `category_project_hours` zkontroluje jeho `type`
- Sečte hodiny pouze z projektů s `type = 'billable'`
- Škálovatelné projekty (`type = 'scalable'`) se nepočítají do fakturovatelných hodin
- Ostatní projekty (`type = 'other'`) se nepočítají do fakturovatelných hodin

**Pseudokód:**
```javascript
// Načíst projekty
const projects = await getProjects(userId);

// Pro každý den v týdnu
weekEntries.forEach(entry => {
  const categoryProjectHours = entry.category_project_hours || {};

  let billableHours = 0;
  let scalableHours = 0;
  let otherHours = 0;

  // Projít všechny kategorie
  Object.keys(categoryProjectHours).forEach(categoryKey => {
    const projectHours = categoryProjectHours[categoryKey];

    // Projít všechny projekty v kategorii
    Object.keys(projectHours).forEach(projectId => {
      const hours = projectHours[projectId];
      const project = projects.find(p => p.id === projectId);

      if (project) {
        if (project.type === 'billable') {
          billableHours += hours;
        } else if (project.type === 'scalable') {
          scalableHours += hours;
        } else {
          otherHours += hours;
        }
      }
    });
  });

  // Hodiny BEZ projektu se počítají jako "other"
  const totalCategoryHours = WORK_CATEGORIES.reduce((sum, cat) => sum + (entry[cat.key] || 0), 0);
  const hoursWithoutProject = totalCategoryHours - billableHours - scalableHours - otherHours;
  otherHours += hoursWithoutProject;
});
```

#### 3. ❌ Upravit Calculator - brát fakturovatelné hodiny z projektů typu billable
**Soubor:** `/src/pages/app/calculator/CalculatorPage.jsx`

**Stejná logika jako v bodu 2** - sčítat pouze hodiny z projektů s `type = 'billable'`

#### 4. ❌ Odstranit user_category_settings tabulku a související kód
**SQL migrace:**
```sql
-- Odstranit tabulku
DROP TABLE IF EXISTS pricepro.user_category_settings CASCADE;

-- Odstranit trigger function
DROP FUNCTION IF EXISTS pricepro.initialize_category_settings() CASCADE;
```

**Soubory ke smazání/úpravě:**
- `/src/services/categorySettings.js` - SMAZAT celý soubor
- Všechny importy `categorySettings` v ostatních souborech

---

## 🎯 Výsledek po refaktoringu:

**Uživatelský workflow:**

1. **Vytvoříš projekty:**
   - "Klient Anna" (typ: fakturovatelný)
   - "Můj kurz XY" (typ: škálovatelný)
   - "Můj marketing" (typ: ostatní)

2. **V trackeru zadáváš čas:**
   - Kategorie: "Tvorba obsahu"
   - Projekt: "Klient Anna" → automaticky FAKTUROVATELNÉ
   - Hodiny: 3

3. **Ve výsledcích vidíš:**
   - Fakturovatelné hodiny: 3h (z projektu "Klient Anna")
   - Škálovatelné hodiny: 0h
   - Ostatní hodiny: 0h

4. **V kalkulačce:**
   - Automaticky načte POUZE fakturovatelné hodiny (z projektů typu "billable")
   - Škálovatelná práce se NEPOČÍTÁ do hodinovky

---

## 🐛 KRITICKÁ CHYBA - Kalkulačka hodinovky a odvody

### Problém:
**Soubor:** `/src/pages/app/calculator/CalculatorPage.jsx`

Kalkulačka nemá samostatný krok pro odvody a daně specifický pro OSVČ v ČR.

### Co je špatně:

**Současná struktura kroků:**
1. Životní náklady
2. Reálný čas (fakturovatelné hodiny)
3. Tržní hodnota (koeficienty)

**Chybějící:** Samostatný krok pro ODVODY A DANĚ mezi krokem 1 a 2!

### Správná struktura kroků:

1. **Životní náklady** (bydlení, živobytí, byznys, úspory)
2. **Reálný čas** (fakturovatelné hodiny)
3. **Odvody a daně** (NOVÝ KROK - specifický pro OSVČ v ČR)
4. **Tržní hodnota** (koeficienty zkušenosti, specializace atd.)

### Nový krok 3: Odvody a daně

**Logika pro ČR:**
- V ČR mají OSVČ specifický systém odvodů
- Zálohy na zdravotní a sociální pojištění jsou minimálně fixní částky (cca 10 000 Kč/měsíc)
- Plus daň z příjmu
- Počítáme z **mezivýpočtu** (životní náklady ÷ fakturovatelné hodiny)

**Výpočet (hodinovka):**
```javascript
// Z kroku 1 a 2
const lifeCosts = housing + living + business + savings; // např. 50 000 Kč/měsíc
const billableHoursMonthly = billableHoursWeekly * 4; // např. 80 hodin/měsíc

// MEZIVÝPOČET - minimální hodinovka BEZ odvodů
const baseHourlyRate = lifeCosts / billableHoursMonthly; // 50 000 / 80 = 625 Kč/h

// ODVODY - koeficient 1.3 (30% na odvody a daně)
const contributionsPerHour = baseHourlyRate * 0.3; // 625 × 0.3 = 187,5 Kč/h

// ALE minimálně 10 000 Kč/měsíc
const minContributionsPerHour = 10000 / billableHoursMonthly; // 10 000 / 80 = 125 Kč/h

// Použijeme větší z obou
const finalContributionsPerHour = Math.max(contributionsPerHour, minContributionsPerHour); // 187,5 Kč/h

// HODINOVKA S ODVODY (před koeficienty tržní hodnoty)
const hourlyRateWithContributions = baseHourlyRate + finalContributionsPerHour; // 625 + 187,5 = 812,5 Kč/h
```

**Příklad 1 (běžný případ):**
- Životní náklady: 50 000 Kč/měsíc
- Fakturovatelné hodiny: 80 h/měsíc
- **Mezivýpočet (BEZ odvodů):** 50 000 / 80 = **625 Kč/h**
- Odvody 30%: 625 × 0.3 = 187,5 Kč/h
- Minimum odvodů: 10 000 / 80 = 125 Kč/h
- **Odvody:** 187,5 Kč/h (větší než minimum)
- **Hodinovka S odvody:** 625 + 187,5 = **812,5 Kč/h**

**Příklad 2 (nízké náklady, hodně hodin):**
- Životní náklady: 25 000 Kč/měsíc
- Fakturovatelné hodiny: 120 h/měsíc
- **Mezivýpočet (BEZ odvodů):** 25 000 / 120 = **208 Kč/h**
- Odvody 30%: 208 × 0.3 = 62,5 Kč/h
- Minimum odvodů: 10 000 / 120 = 83,3 Kč/h
- **Odvody:** 83,3 Kč/h (minimum je větší)
- **Hodinovka S odvody:** 208 + 83,3 = **291,3 Kč/h**

### Co implementovat:

1. **Přidat nový krok do `steps` array (jako krok 3):**
```javascript
const steps = [
  { label: 'Životní náklady', description: 'Kolik MUSÍTE vydělat?', icon: Home },
  { label: 'Reálný čas', description: 'Kolik hodin OPRAVDU fakturujete?', icon: Clock },
  { label: 'Odvody a daně', description: 'OSVČ v ČR - kolik odvádíte?', icon: FileText }, // NOVÝ KROK 3
  { label: 'Tržní hodnota', description: 'Kolik DOOPRAVDY stojíte?', icon: BarChart3 },
];
```

2. **Vytvořit UI pro NOVÝ krok 3 (Odvody a daně):**

**Zobrazit:**
- **Mezivýpočet (read-only, info card):**
  - "Minimální hodinovka BEZ odvodů: XXX Kč/h"
  - Vypočteno: Životní náklady ÷ Fakturovatelné hodiny
  - Např. 50 000 / 80 = 625 Kč/h

- **Výpočet odvodů (automaticky):**
  - Odvody 30%: 625 × 0.3 = 187,5 Kč/h
  - Minimum: 10 000 / 80 = 125 Kč/h
  - **Použito:** 187,5 Kč/h (větší hodnota)

- **Výsledek (zvýrazněný):**
  - "Hodinovka S odvody: 812,5 Kč/h"
  - Toto jde do dalšího kroku (Tržní hodnota)

- **Helper text:**
  "V ČR platí OSVČ minimálně cca 10 000 Kč měsíčně na odvody (zdravotní + sociální pojištění + daň z příjmu). U vyšších příjmů počítáme s koeficientem 1.3 (30% navíc na odvody a daně)."

**Breakdown card (volitelně):**
```
Životní náklady:        50 000 Kč/měsíc
Fakturovatelné hodiny:  80 h/měsíc
─────────────────────────────────────
Základní hodinovka:     625 Kč/h
+ Odvody a daně:        +187,5 Kč/h (30%)
═════════════════════════════════════
Hodinovka s odvody:     812,5 Kč/h
```

3. **Upravit výpočet:**
```javascript
// Nová helper funkce
const getBaseHourlyRate = () => {
  const lifeCosts = getLifeCosts(); // z kroku 1
  const monthlyBillable = getMonthlyBillableHours(); // z kroku 2
  if (monthlyBillable === 0) return 0;
  return lifeCosts / monthlyBillable;
};

// Nová helper funkce
const getContributionsPerHour = () => {
  const baseRate = getBaseHourlyRate();
  const monthlyBillable = getMonthlyBillableHours();
  if (monthlyBillable === 0) return 0;

  // 30% z hodinovky NEBO minimálně 10 000 Kč/měsíc
  const contributionsByPercent = baseRate * 0.3;
  const contributionsByMinimum = 10000 / monthlyBillable;

  return Math.max(contributionsByPercent, contributionsByMinimum);
};

// Upravená funkce - hodinovka S odvody (před koeficienty)
const getHourlyRateWithContributions = () => {
  return getBaseHourlyRate() + getContributionsPerHour();
};

// Minimální hodinovka = hodinovka s odvody (před koeficienty tržní hodnoty)
const getMinimumHourly = () => {
  return getHourlyRateWithContributions();
};

// Doporučená hodinovka = s odvody × koeficienty
const getRecommendedHourly = () => {
  return getHourlyRateWithContributions() * getCoefficients();
};
```

### Priorita: 🚨 VYSOKÁ
Toto přímo ovlivňuje správnost doporučené hodinovky pro OSVČ v ČR. Bez správného výpočtu odvodů vychází podhodnocená hodinovka.

---

## 🎯 NOVÉ KOEFICIENTY - Změna z násobení na sčítání

### Současný stav (NÁSOBENÍ):
```javascript
const coefficients = experience × specialization × portfolio × demand;
// Příklad: 1.2 × 1.3 × 1.1 × 1.15 = 1.9734 (navýšení o 97%)
```

### Nový stav (SČÍTÁNÍ):
```javascript
const coefficients = 1 + experience + breadth + education + portfolio + demand;
// Příklad: 1 + 0.3 + 0.2 + 0.2 + 0.15 + 0.2 = 2.05 (navýšení o 105%)
```

**Důvod změny:** Sčítání je intuitivnější a lépe kontrolovatelné. Násobení vytváří příliš velké nárůsty při kombinaci více faktorů.

---

### Nové kategorie a hodnoty koeficientů:

#### 1. 💼 Zkušenosti v oboru
- 0-2 roky: **+0%**
- 3-5 let: **+30%**
- 6-10 let: **+50%**
- 10+ let: **+70%**

#### 2. 📦 Šíře nabídky
*(Nahrazuje původní "Generalista vs. Specialista")*
- Úzká nabídka (1-2 služby): **+0%**
- Střední nabídka (3-4 služby): **+20%**
- Široká nabídka (komplexní řešení, 5+ služeb): **+30%**
- Ultra-specializace (jediný v ČR, unikátní): **+50%**

**Důvod změny:** Generalista i specialista mají výhody. Generalista = "5v1" (levnější než 5 lidí), Specialista = expert (unikátní znalost). Nová kategoria lépe reflektuje realitu.

#### 3. 🎓 Kvalifikace a vzdělání
*(NOVÁ kategorie)*
- Žádné formální vzdělání v oboru: **+0%**
- Kurzy a workshopy: **+10%**
- Certifikace v oboru: **+20%**
- VŠ vzdělání v oboru: **+25%**
- VŠ + specializované certifikace: **+35%**

**Důvod přidání:** Vzdělání je důležité zejména v regulovaných oborech (koučování, terapie, IT, účetnictví).

#### 4. 🏆 Portfolio a reference
- Žádné nebo málo: **+0%**
- Nějaké reference: **+15%**
- Silné portfolio a prokázané výsledky: **+30%**

#### 5. 📈 Poptávka po vašich službách
- Malá poptávka: **+0%**
- Střední poptávka: **+20%**
- Velká poptávka: **+40%**
- Mám čekačku (vybírám si klienty): **+50%**

---

### Maximální možný koeficient:
**70% + 50% + 35% + 30% + 50% = +235%** (celkem 3.35×)

---

### UI implementace: Accordiony

**Design:**
```
┌──────────────────────────────────────────────────┐
│ 🎯 TRŽNÍ HODNOTA - Váš tržní koeficient          │
│                                                  │
│ ▼ Zkušenosti v oboru              [+30%] ✓      │
│   ○ 0-2 roky (+0%)                               │
│   ● 3-5 let (+30%)                               │
│   ○ 6-10 let (+50%)                              │
│   ○ 10+ let (+70%)                               │
│                                                  │
│ ▶ Šíře nabídky                    [+0%]          │
│                                                  │
│ ▶ Kvalifikace a vzdělání          [+0%]          │
│                                                  │
│ ▶ Portfolio a reference           [+0%]          │
│                                                  │
│ ▶ Poptávka po službách            [+0%]          │
│                                                  │
├──────────────────────────────────────────────────┤
│ 📊 Váš celkový tržní koeficient: +30%            │
│                                                  │
│ Minimální hodinovka: 915 Kč/h                    │
│ S tržním koeficientem: 915 + 275 = 1 190 Kč/h   │
└──────────────────────────────────────────────────┘
```

**Features:**
- První accordion defaultně otevřený, ostatní zavřené
- Vedle názvu accordionu zobrazit aktuální výběr (+30%)
- Live update celkového koeficientu při každé změně
- Dole živý přepočet: základ + (základ × koeficient) = výsledná hodinovka
- Radio buttons pro výběr (pouze jedna možnost na kategorii)

**Soubory k úpravě:**
- `/src/pages/app/calculator/CalculatorPage.jsx`
- Upravit konstanta arrays (experienceOptions, atd.)
- Změnit výpočet z násobení na sčítání
- UI refaktoring na Accordion komponenty (Material-UI)

---

### Porovnání starých vs. nových koeficientů

**Příklad: Zkušený specialista s referencemi a střední poptávkou**

| | Staré (násobení) | Nové (sčítání) |
|---|---|---|
| Zkušenosti | 1.2 | +30% |
| Specializace/Šíře | 1.3 | +50% (ultra-spec.) |
| Vzdělání | — | +20% (certifikace) |
| Portfolio | 1.1 | +15% |
| Poptávka | 1.15 | +20% |
| **Celkem** | **1.9734** (+97%) | **2.35** (+135%) |

**Rozdíl:** Nový systém dává vyšší koeficient (+38%), ale je transparentnější a srozumitelnější pro uživatele.

---

## 📝 NOVÝ VÝPOČET ODVODŮ - Oprava vzorce

### Současný stav (ŠPATNĚ):
```javascript
const taxes = subtotal * 0.15; // Jen 15% daně
return subtotal + taxes;
```

### Správný stav:
```javascript
const netCosts = housing + living + business + savings; // Čistý příjem na život
const businessCosts = parseFloat(businessCosts) || 0;   // Náklady na podnikání (extra)
const subtotal = netCosts + businessCosts;

// Odvody: 15% z celku (půlka z 30%) NEBO minimálně 10 000 Kč/měsíc
const monthlyBillable = getMonthlyBillableHours();
const contributionsByPercent = subtotal * 0.15;
const contributionsByMinimum = 10000;
const contributions = Math.max(contributionsByPercent, contributionsByMinimum);

const grossIncome = subtotal + contributions;
return grossIncome;
```

**Proč 15% a ne 30%?**
- Odvody OSVČ se počítají z **poloviny příjmů** (paušální výdaje 60% nebo skutečné výdaje)
- 30% odvody z poloviny = 15% z celku
- Ale MINIMÁLNĚ 10 000 Kč/měsíc (fixní zálohy na zdravotní + sociální)

**Příklad:**
- Čistý příjem: 50 000 Kč
- Podnikání: 20 000 Kč
- **Celkem: 70 000 Kč**
- Odvody: 70 000 × 0.15 = 10 500 Kč (> 10 000 Kč min.)
- **Hrubý příjem: 80 500 Kč**

---

## 🔧 VÝPOČET B - Odstranit OSVČ koeficient

### Současný stav (ŠPATNĚ):
```javascript
const hourlyWithOSVC = baseHourly * OSVC_COEFFICIENT; // 291 × 1.3 = 378 Kč/h
```

### Správný stav:
```javascript
const hourlyWithOSVC = baseHourly; // 291 Kč/h (BEZ koeficientu!)
```

**Důvod:** Průměrná hrubá mzda už odvody obsahuje. OSVČ koeficient se aplikuje POUZE ve výpočtu A (na odvody), ne ve výpočtu B.

---

---

## ⚠️ KRITICKÁ PRAVIDLA PRO IMPLEMENTACI

### 🎨 Dark/Light Mode
**POVINNÉ:**
- ✅ Používat `useTheme()` hook z Material-UI
- ✅ Používat konstanty z `/src/constants/colors.js`:
  - `INFO_CARD_STYLES[theme.palette.mode]` pro info karty
  - `CARD_ICON_STYLES[theme.palette.mode]` pro ikony
  - `WARNING_CARD_STYLES[theme.palette.mode]` pro varování
- ✅ Testovat OBOJÍ módy před commitem
- ❌ NIKDY nepoužívat hardcoded barvy (např. `bgcolor: '#fff'`)

**Příklad správně:**
```javascript
import { useTheme } from '@mui/material/styles';
import { INFO_CARD_STYLES } from '../../../constants/colors';

const theme = useTheme();

<Card sx={{
  bgcolor: INFO_CARD_STYLES[theme.palette.mode].bgcolor,
  border: INFO_CARD_STYLES[theme.palette.mode].border
}}>
```

---

### 🧩 Modularita
**POVINNÉ:**
- ✅ Vytvářet **separátní komponenty** pro složité UI části
- ✅ Komponenty max. 300 řádků - pokud víc, rozdělit
- ✅ Využívat existing komponenty z `/src/components/`
- ✅ Nové komponenty dávat do správných složek:
  - `/src/components/calculator/` - pro kalkulačku
  - `/src/components/ui/` - pro obecné UI komponenty
  - `/src/components/tracker/` - pro tracker
- ❌ NIKDY nedělat monolitické soubory 1000+ řádků

**Příklad modularizace pro nové koeficienty:**
```
/src/components/calculator/
├── CoefficientAccordion.jsx       (obecný accordion wrapper)
├── ExperienceCoefficient.jsx      (zkušenosti)
├── BreadthCoefficient.jsx         (šíře nabídky)
├── EducationCoefficient.jsx       (vzdělání)
├── PortfolioCoefficient.jsx       (portfolio)
├── DemandCoefficient.jsx          (poptávka)
└── CoefficientSummary.jsx         (souhrn + live přepočet)
```

---

### 🛡️ Zachování funkčností
**POVINNÉ - NESMÍ ZMIZET:**

#### Kalkulačka:
- ✅ Historie výpočtů (ukládání do DB, zobrazení minulých výsledků)
- ✅ Načítání dat z trackeru (integrace s time entries)
- ✅ Výpočet A i výpočet B (oba přístupy)
- ✅ Porovnání s průměrnými mzdami (2026 wage constants)
- ✅ Graf porovnání (LineChart - recommended vs. premium)
- ✅ Export výsledků / sdílení
- ✅ Navigace mezi kroky (step stepper)
- ✅ Ukládání rozdělaných výpočtů (draft state)

#### Tracker:
- ✅ Zadávání času po kategoriích
- ✅ Přiřazení klient → projekt → téma
- ✅ Zobrazení témat jako chips
- ✅ Validace (max 24h denně)
- ✅ Týdenní/měsíční přehledy
- ✅ Filtry (podle klienta, projektu, kategorie)

#### Nastavení:
- ✅ Správa klientů (CRUD)
- ✅ Správa projektů (CRUD + typy: billable/scalable/other)
- ✅ Správa témat (CRUD)
- ✅ Navigace mezi settings pages (chips)

---

### 📝 Checklist před commitem

**PŘED KAŽDÝM COMMITEM zkontrolovat:**
- [ ] Dark mode funguje ✅
- [ ] Light mode funguje ✅
- [ ] Žádné console.error nebo warnings ✅
- [ ] Všechny existující funkce fungují ✅
- [ ] Komponenty jsou modulární (max. 300 řádků) ✅
- [ ] Používám konstanty z colors.js ✅
- [ ] Testoval jsem mobile responsiveness ✅
- [ ] České texty (žádná angličtina v UI) ✅

---

---

## 🐛 BUG - Scroll position při navigaci

### Problém:
Když uživatel klikne na položku v menu, stránka se zobrazí odshora, ale scroll position zůstane dole → vidí konec stránky místo začátku.

### Řešení:
Přidat ScrollToTop komponentu, která scrolluje nahoru při každé změně route.

**Soubor:** `/src/components/layout/ScrollToTop.jsx` (NOVÝ)

```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
```

**Použití v App.jsx:**
```javascript
import { ScrollToTop } from './components/layout/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop /> {/* Přidat hned za <Router> */}
      <Routes>
        ...
      </Routes>
    </Router>
  );
}
```

**Priorita:** 🟡 STŘEDNÍ (UX problém, ale neblokující)

---

---

## 📦 BACKLOG - Budoucí rozšíření

### ⚠️ KONFLIKTY S AKTUÁLNÍM TODO - NUTNÉ PROBRAŤ!

#### 🔴 KONFLIKT 1: Dvě hodinovky (minimální vs. fakturační)
**Z materiálů:**
- **Minimální orientační (interní)** = celkové náklady / všechny hodiny
- **Fakturační (pro klienta)** = celkové náklady / jen fakturovatelné hodiny

**Současné TODO:** Máme pouze JEDNU minimální hodinovku (náklady / fakturovatelné)

**OTÁZKA:** Chceme zobrazovat OBĚ vedle sebe? To změní UI kalkulačky!

---

#### 🟡 KONFLIKT 2: Uživatelská stránka (diplomy, certifikace)
**Tvůj nápad:**
- Stránka kde uživatel zadá diplomy, certifikace, počet klientů, konkurenční výhody
- Aby viděla pohromadě, jak je dobrá

**Současné TODO:** Máme nové koeficienty s kategorií "Kvalifikace a vzdělání"

**OTÁZKA:**
- Chceš PROPOJIT? (uživatel zadá diplomy na profilu → automaticky se nastaví koeficient?)
- Nebo samostatně? (profil = psychologická podpora, koeficienty = výpočet?)

---

#### 🟡 KONFLIKT 3: Tracker - rozšíření osobního času
**Tvůj nápad:**
- Přidat: zvířata, zábava
- Možnost vypnout sledování osobního času úplně

**Současné TODO:** Upravujeme TrackerDayPage (klient→projekt→téma)

**OTÁZKA:** Máme to udělat TEĎKA společně s úpravami, nebo až pak?

---

#### 🟡 KONFLIKT 4: Expresní termíny (+50% cena)
**Tvůj nápad:**
- Pro práci 1:1 zahrnout možnost expresního termínu
- Automaticky zvednout cenu o 50%+

**Současné TODO:** Přepracováváme kalkulačku (nové koeficienty, odvody)

**OTÁZKA:** Má to být další koeficient? Nebo samostatný přepínač "Je to expresní zakázka"?

---

#### 🟢 KONFLIKT 5: Alerty v trackeru - jen když relevantní
**Tvůj nápad:**
- NE alert po 1 vyplněném dni ("pracuješ málo/moc")
- ANO alert při extrémech (3h spánek, 15h práce) hned ten den

**Současné TODO:** Upravujeme tracker

**POZNÁMKA:** Toto můžeme udělat klidně teď, je to jen úprava validace.

---

### 🎨 DESIGN PRAVIDLA (přidat do TODO)

#### ❌ EMOJI → ✅ Lucide ikony
- Odstranit všechny emoji z aplikace
- Používat POUZE Lucide ikony
- Neplýtvat s ikonami - "ať to není jak v cirkuse"
- Ikony jen tam, kde dávají smysl (navigace, akce, ilustrace konceptu)

**Soubory k prohledání:**
- Všechny .jsx soubory
- Hledat emoji znaky (🎯, 💼, 📈, atd.)
- Nahradit Lucide ikonami nebo odstranit

---

### 🔥 VYSOKÁ PRIORITA (ovlivňují kalkulačku)

#### 1. Náklady na asistentku/tým
**Kde:** Krok 1 "Životní náklady" → přidat do "Náklady na podnikání"

**Současný stav:**
- Bydlení
- Živobytí
- Byznys náklady (general)
- Úspory

**Nový stav:**
- Bydlení
- Živobytí
- **Náklady na podnikání:**
  - Software, nástroje
  - Marketing
  - Asistentka, tým
  - Účetní
  - Ostatní
- Úspory

**Poznámka:** Toto můžeme přidat snadno, neovlivňuje výpočet.

---

#### 2. Realistická kapacita (44 týdnů, ne 52)
**Z materiálů:**
- Pracovní rok má reálně 44 týdnů (po odečtení dovolené, svátků, nemocí)
- 52 - 8 = 44 pracovních týdnů

**Implementace:**
- Přidat do kalkulačky vstup: "Kolik týdnů dovolené/volna plánujete?" (default 8)
- Přepočítat měsíční kapacitu: (52 - volno) / 12 × týdenní hodiny

**Příklad:**
- Týdenní hodiny: 40h
- Volno: 8 týdnů
- Měsíční kapacita: (52 - 8) / 12 × 40 = **147h/měsíc** (místo 160h)

---

#### 3. Finanční rezerva v nákladech
**Z materiálů:**
- Cena musí pokrýt nejen aktuální náklady, ale i budoucnost
- Finanční rezervu na 3-6 měsíců
- Spoření na důchod (OSVČ má nízký státní důchod)
- Investice do budoucnosti

**Implementace:**
Do kroku "Životní náklady" přidat sekci **"Platby budoucímu já"**:
- Měsíční tvorba rezervy (Kč)
- Spoření na důchod (Kč)
- Investice (Kč)

**Bonus:** Zobrazit progress bar "Kolik měsíců rezervy už máš?"
- Uživatel zadá: Aktuální rezerva (Kč)
- Výpočet: Aktuální rezerva / Měsíční náklady = X měsíců

---

### 🟡 STŘEDNÍ PRIORITA (nové funkce)

#### 4. Reality Check - skutečná hodinovka (zpětná kontrola)
**Z materiálů:**
- Vzorec: Vydělané peníze / Celkový počet hodin (včetně režie)
- "Test pravdy" - uživí mě to, nebo budu ve stresu?

**Implementace:**
Nová stránka/sekce **"Reality Check"**

**Vstup:**
- Kolik jsi vydělala za poslední 3 měsíce? (Kč)
- Kolik hodin celkem jsi pracovala? (z trackeru nebo odhad)

**Výstup:**
- Skutečná hodinovka: XX Kč/h
- Porovnání:
  - Minimální doporučená: YY Kč/h (z kalkulačky)
  - Rozdíl: +/- ZZ Kč/h
- **Verdikt:**
  - ✅ "Super! Vyděláváš nad minimální hodinovkou"
  - ⚠️ "Pozor! Vyděláváš MÉNĚ než minimální - čas zdražit nebo zefektivnit"

---

#### 5. Kalkulátor zdražení
**Z materiálů:**
- Příklad: Zdražíš o 40% → odejde 30% klientů → vyděláš STEJNĚ, ale máš o 30% více času
- Vzorec: 10 klientů × 700 Kč = 7000 Kč → po zdražení na 1000 Kč stačí 7 klientů

**Implementace:**
Nová sekce **"Kalkulátor zdražení"**

**Vstup:**
- Aktuální cena za službu: Kč
- Počet klientů/zakázek měsíčně: X
- Nová cena (plánovaná): Kč

**Výstup:**
- Aktuální příjem: X klientů × Y Kč = Z Kč
- Po zdražení:
  - Kolik klientů můžeš ztratit a stále vydělat stejně: W klientů
  - Kolik % klientů to je: P%
  - Kolik času ušetříš: Q hodin

**Příklad:**
```
Aktuálně: 10 klientů × 700 Kč = 7 000 Kč
Nová cena: 1 000 Kč (+43%)

Potřebuješ jen: 7 klientů (můžeš ztratit 3, tedy 30%)
Ušetříš: 30% času = cca 12 hodin měsíčně
```

---

#### 6. Signály pro zdražení (diagnostika)
**Z materiálů:**
Čas zdražit je, když:
- Máš hodně práce, ale málo peněz
- Máš plnou kapacitu (vybíráš si mezi poptávkami)
- Nemáš radost z nových poptávek
- Klienti si neváží tvého času

**Implementace:**
Dotazník **"Měla bych zdražit?"**

**Otázky:**
1. Máš plnou kapacitu? (ANO/NE)
2. Odmítáš nové poptávky kvůli nedostatku času? (ANO/NE)
3. Cítíš se přepracovaná, ale peníze nestačí? (ANO/NE)
4. Klienti očekávají nepřiměřené změny zdarma? (ANO/NE)
5. Dostáváš hodně poptávek? (ANO/NE)
6. Bojíš se říct cenu nahlas? (ANO/NE)

**Výstup:**
- **5-6 ANO:** "🔥 Určitě zdraž! Máš všechny signály."
- **3-4 ANO:** "⚠️ Zvažuj zdražení - máš na to prostor."
- **0-2 ANO:** "✅ Zatím OK, ale sleduj situaci."

---

### 🟢 NIŽŠÍ PRIORITA (nice to have)

#### 7. Generátor balíčků (variantní nabídky)
**Z materiálů:**
- Nabídni 3 varianty (Základní, Oblíbený, Prémiový)
- Dražší varianta slouží jako "kotva" - prostřední pak vypadá rozumně

**Implementace:**
Generátor **"3 cenové varianty"**

**Vstup:**
- Vypočtená hodinovka: X Kč/h
- Typ služby: (koučink, design, copywriting...)

**Výstup:**
```
┌─────────────────────────────────────────────┐
│ ZÁKLADNÍ          OBLÍBENÝ ⭐      PRÉMIOVÝ │
├─────────────────────────────────────────────┤
│ X Kč              1.5×X Kč          2×X Kč  │
│                                             │
│ Co zahrnuje:      Co zahrnuje:    Co zahr.: │
│ - Feature A       - Vše ze Zákl.  - Vše z O.│
│ - Feature B       - Feature C     - Feature D│
│                   - Feature E     - Priorita │
└─────────────────────────────────────────────┘
```

**Tipy co zahrnout** (podle typu služby)

---

#### 8. SWOT analýza pro obhajobu ceny
**Z materiálů:**
- Silné stránky = proč má klient platit víc
- Příležitosti = vzdělání, reference, prezentace
- Hrozby = konkurence (ale nekopírovat její ceny)
- Slabé stránky = mindset, strach

**Implementace:**
Interaktivní **SWOT zaměřený na cenotvorbu**

Uživatel vyplní:
- **Strengths (Silné stránky):** Co umím nejlép? Jaké mám výsledky?
- **Weaknesses (Slabé stránky):** Co mi brání účtovat víc? (mindset, strach...)
- **Opportunities (Příležitosti):** Co můžu využít? (vzdělání, reference, nový trh...)
- **Threats (Hrozby):** Co mi hrozí? (levnější konkurence, AI...)

**Výstup:**
- "Tvé 3 hlavní argumenty pro vyšší cenu"
- Doporučení jak ošetřit slabé stránky

---

#### 9. Šablony odpovědí na námitky
**Z materiálů:**
- "Je to drahé" → neomlouvat se, vysvětlit hodnotu
- "Konkurence to má levněji" → zdůraznit unikátnost
- "Nemáme rozpočet" → upravit rozsah, ne cenu

**Implementace:**
Sekce **"Jak reagovat na námitky"**

Připravené šablony podle námitky:
- Námitka: "Je to drahé"
  - ❌ Špatně: "Omlouvám se, můžu dát slevu"
  - ✅ Dobře: "Chápu. Pojďme se podívat na hodnotu, kterou to přinese..."

- Námitka: "Konkurence má 500 Kč/h"
  - ❌ Špatně: "OK, taky to můžu za 500"
  - ✅ Dobře: "Ano, existují levnější varianty. Rozdíl je v [tvá unikátnost]..."

**Bonus:** Personalizace podle SWOT analýzy

---

#### 10. Neplacené aktivity - detailní breakdown
**Z materiálů:**
Do nefakturovatelné práce patří:
- Administrativa a účetnictví
- Marketing a tvorba obsahu
- Vzdělávání (kurzy, čtení)
- Komunikace s neklienty (poptávky, co nedopadnou)

**Implementace:**
Rozšířit tracker o **podkategorie režijní práce**

**Současné kategorie:**
- Komunikace s klienty
- Tvorba obsahu
- Sociální sítě
- Administrativa
- Zprávy
- Vzdělávání
- Billable work (fakturovatelná)
- Ostatní

**Rozšíření:**
Každá kategorie může mít **tagy**:
- Komunikace: [Klient] / [Poptávka] / [Network]
- Administrativa: [Účetnictví] / [Email] / [Plánování]
- Vzdělávání: [Kurz] / [Kniha] / [Research]

**Výstup:**
"Tento měsíc jsi strávila 8 hodin komunikací, které nedopadly → čas zefektivnit kvalifikaci leadů?"

---

### 💎 LENČINY NÁPADY

#### 11. Uživatelská stránka - "Jsem skvělá!"
**Účel:**
- Psychologická podpora
- Vidět pohromadě své úspěchy
- Přestat se podhodnocovat

**Co tam uživatel zadá:**
- **Diplomy a certifikace** (s možností uploadu PDF/fotky)
- **Počet klientů celkem** (rukama prošlo)
- **Počet kurzů/produktů** (prodáno, vytvořeno)
- **Unikátnosti** (co umím, co nikdo jiný)
- **Konkurenční výhody** (proč si vybrat mě)
- **Superpower** (co mě nejvíc baví, v čem jsem expert)
- **Testimonials** (reference od klientů - text nebo screenshot)

**Výstup:**
Hezká stránka typu "portfolio", ale PRO SEBE (ne pro klienty)

**Bonus:**
- Sdílitelný link "Moje achievementy"
- Export do PDF
- **Propojení s koeficienty?** (pokud zadá VŠ diplom → automaticky +25% v Kvalifikaci)

---

#### 12. Meditace pro ukotvení ceny
**Účel:**
- Pomoci ženě si ukotvit svou hodnotu
- Překonat mindsetové bloky kolem ceny

**Implementace:**
- Upload audio souboru (.mp3, .wav)
- Přehrávač přímo v aplikaci
- Případně více meditací (podle tématu):
  - "Jsem hodnotná"
  - "Moje cena odráží mou hodnotu"
  - "Zasloužím si dobře vydělávat"

**Kam umístit:**
- Sekce "Mindset a sebehodnota"
- Nebo přímo v kalkulačce jako "Potřebuješ si ukotvit cenu? Poslechni si meditaci"

---

#### 13. Edukace: Cena - Hodnota - Sebehodnota
**Účel:**
- Vysvětlit souvislost
- Proč podhodnocená cena = podhodnocená sebehodnota
- Jak na tom pracovat

**Implementace:**
Sekce **"Proč je cena o tobě"**

**Obsah:**
- Krátký článek/infografika
- Video?
- Kvíz na sebereflexi
- Cvičení na posílení sebehodnoty

**Kam umístit:**
- Dashboard (přivítání nových uživatelek)
- Nebo samostatná sekce "Vzdělávání"

---

#### 14. Tracker - rozšíření osobního času
**Tvůj požadavek:**
- Přidat: Čas se zvířaty, Zábava
- Možnost **NESLEDOVAT osobní čas vůbec** (jen pracovní)

**Současné osobní kategorie:**
- Spánek
- Rodinný čas
- Osobní čas

**Nové:**
- Spánek
- Rodinný čas
- Čas se zvířaty
- Zábava/Koníčky
- Osobní péče

**Nastavení:**
```
[ ] Chci sledovat osobní čas
    (Pokud NE → zobrazovat jen pracovní kategorie)
```

**Dopad na kalkulačky:**
- Pokud uživatel NESLEDUJE osobní čas → nepočítat validaci "24h max"
- Počítat jen s pracovními hodinami

---

#### 15. Alerty v trackeru - jen když relevantní
**Současný stav:**
- Alert už po 1 vyplněném dni ("pracuješ moc/málo")

**Nový stav:**
- **NE alert po 1 dni** (není relevantní)
- **ANO alert při extrémech:**
  - Spánek < 5h → "⚠️ Dnes jsi spala jen Xh. Nezapomeň na odpočinek!"
  - Práce > 12h → "⚠️ Dnes jsi pracovala Xh. Dej si pauzu!"
  - 0h celkem → (ticho, možná volno)

**Kdy zobrazit celkové alerty:**
- Po vyplnění **alespoň 5 dní** (nebo celý týden)
- Pak teprve říct "Tento týden jsi měla průměrně X fakturovatelných hodin"

---

#### 16. Gamifikace, motivace, oslavy
**Tvůj požadavek:**
- Něco vtipného
- Vizuály nebo oslavy
- Sbírání bodů
- Motivace

**Nápady:**
- **Achievementy:**
  - "První vyplněný týden!" 🏆
  - "Zdražila jsi poprvé!" 🎉
  - "Máš 3měsíční rezervu!" 💰
  - "Prvních 10 klientů!" 🌟

- **Progress tracking:**
  - "Jsi na 60% cesty k minimální hodinovce"
  - "Vyplnila jsi už 20 dní v trackeru - skvělé!"

- **Vizuální motivace:**
  - Confetti animace při dokončení kalkulačky
  - Progress bar pro rezervu
  - "Level up" při dosažení milníků

- **Týdenní recap:**
  - "Tento týden jsi dokázala X, Y, Z - paráda!"

**Důležité:** Neinvazivní, pozitivní, ne "gaming" ale "empowering"

---

### 🎯 SHRNUTÍ PRIORIT (můj návrh)

| Priorita | Funkce | Proč | Konflikt s TODO? |
|----------|--------|------|------------------|
| 🔴 KRITICKÉ | Dvě hodinovky (minimální vs. fakturační) | Základní koncept kalkulace | ✅ ANO - ovlivňuje výpočet A |
| 🔴 KRITICKÉ | Expresní termíny (+50%) | Zásadní pro 1:1 práci | ✅ ANO - ovlivňuje kalkulačku |
| 🔴 KRITICKÉ | Emoji → Lucide ikony | Design pravidlo | ✅ ANO - ovlivňuje celou UI |
| 🔥 VYSOKÁ | Náklady na asistentku/tým | Chybějící položka v nákladech | ❌ NE |
| 🔥 VYSOKÁ | Realistická kapacita (44 týdnů) | Zásadně mění výpočet | ✅ ANO - ovlivňuje kalkulačku |
| 🔥 VYSOKÁ | Finanční rezerva | Klíčové pro udržitelnost | ❌ NE - jen rozšíření kroku 1 |
| 🔥 VYSOKÁ | Alerty jen když relevantní | UX problém | ✅ ANO - upravujeme tracker |
| 🟡 STŘEDNÍ | Reality Check | Kontrola zpětně | ❌ NE - nová sekce |
| 🟡 STŘEDNÍ | Kalkulátor zdražení | Praktický nástroj | ❌ NE - nová sekce |
| 🟡 STŘEDNÍ | Signály pro zdražení | Diagnostika | ❌ NE - nová sekce |
| 🟡 STŘEDNÍ | Uživatelská stránka "Jsem skvělá" | Mindset | ⚠️ MOŽNÁ - propojit s koeficienty? |
| 🟡 STŘEDNÍ | Tracker - zvířata, zábava, volba nesledovat | Rozšíření trackeru | ✅ ANO - upravujeme tracker |
| 🟢 NIŽŠÍ | Generátor balíčků | Nice to have | ❌ NE |
| 🟢 NIŽŠÍ | SWOT analýza | Podpora mindsetu | ❌ NE |
| 🟢 NIŽŠÍ | Šablony na námitky | Edukace | ❌ NE |
| 🟢 NIŽŠÍ | Neplacené aktivity breakdown | Detailní tracking | ❌ NE |
| 🟢 NIŽŠÍ | Meditace pro ukotvení | Mindset | ❌ NE |
| 🟢 NIŽŠÍ | Edukace cena-hodnota | Mindset | ❌ NE |
| 🟢 NIŽŠÍ | Gamifikace | Motivace | ❌ NE |

---

## ✅ Hotové

- ✅ Přidat client_id do projects tabulky (FK na clients)
- ✅ V ProjectsSettingsPage přidat výběr klienta při vytváření projektu
- ✅ Zajistit, že témata jsou vidět v TrackerDayPage jako chips
- ✅ Opravit všechny špatné texty 'projekt/klient' na jen 'projekt'
- ✅ Povolit zadání hodin BEZ klienta/projektu v trackeru
- ✅ Vytváření nového tématu přímo v projektu (inline)
- ✅ Navigace mezi stránkami nastavení (Kategorie, Projekty, Klienti, Témata)
