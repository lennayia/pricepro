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

## ✅ Hotové

- ✅ Přidat client_id do projects tabulky (FK na clients)
- ✅ V ProjectsSettingsPage přidat výběr klienta při vytváření projektu
- ✅ Zajistit, že témata jsou vidět v TrackerDayPage jako chips
- ✅ Opravit všechny špatné texty 'projekt/klient' na jen 'projekt'
- ✅ Povolit zadání hodin BEZ klienta/projektu v trackeru
- ✅ Vytváření nového tématu přímo v projektu (inline)
- ✅ Navigace mezi stránkami nastavení (Kategorie, Projekty, Klienti, Témata)
