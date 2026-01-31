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

## ✅ Hotové

- ✅ Přidat client_id do projects tabulky (FK na clients)
- ✅ V ProjectsSettingsPage přidat výběr klienta při vytváření projektu
- ✅ Zajistit, že témata jsou vidět v TrackerDayPage jako chips
- ✅ Opravit všechny špatné texty 'projekt/klient' na jen 'projekt'
- ✅ Povolit zadání hodin BEZ klienta/projektu v trackeru
- ✅ Vytváření nového tématu přímo v projektu (inline)
- ✅ Navigace mezi stránkami nastavení (Kategorie, Projekty, Klienti, Témata)
